import nodemailer, {type Transporter} from "nodemailer";
import GenericPool from "generic-pool";
import {SMTPConfig, MailerConfig} from "~/src/types/types";
import {WebSocketLogger} from "~/utils/WebSocketLogger";
import {deepEqual, getRandomMember} from "~/utils/arrays";

const logger = WebSocketLogger.getInstance();

export class SMTPTransporterPool {
    private pool?: GenericPool.Pool<Transporter>;
    private static instance: SMTPTransporterPool;
    private smtpOptions?: SMTPConfig;
    private globalConfig?: MailerConfig;

    constructor(SMTPOptions?: SMTPConfig, globalConfig?: MailerConfig) {
        this.smtpOptions = SMTPOptions;
        this.globalConfig = globalConfig;
        if (SMTPOptions && globalConfig) {
            this.setup(SMTPOptions, globalConfig);
        }
    }

    setup(SMTPOptions: SMTPConfig, globalConfig: MailerConfig) {

        if (!this.pool) {
            console.info('Initializing SMTP pool');
            logger.sendLog({type: 'warning', message: 'Initializing SMTP pool'});

            this.pool = GenericPool.createPool({
                    create: async () => {
                        let proxy = undefined;

                        let otherOptions: {[key: string]: any} = {};
                        if (SMTPOptions.user && SMTPOptions.pass) {
                            otherOptions.auth = {user: SMTPOptions.user, pass: SMTPOptions.pass}
                        }

                        if (globalConfig.proxy.useProxy) {
                            const proxyStr = getRandomMember(globalConfig.proxy.list)
                            proxy = `${globalConfig.proxy.protocol}://${proxyStr}`;

                            try {
                                logger.sendLog({ type: 'info', message: `Testing proxy ${proxy}...` });
                                console.info(`Testing proxy ${proxy}...`);

                                const testTransporter = nodemailer.createTransport(
                                    {...otherOptions,
                                        secure: SMTPOptions.port == 465,
                                        proxy, ...SMTPOptions,
                                        // @ts-ignore
                                        tls: {rejectUnauthorized: false, checkServerIdentity: () => null}});

                                if (globalConfig.proxy.useProxy && globalConfig.proxy.protocol == 'socks5') {
                                    testTransporter.set('proxy_socks_module', require('socks'));
                                }

                                await testTransporter.verify();
                            } catch (error) {
                                if (globalConfig.proxy.list.includes(proxyStr)) {
                                    logger.sendLog({
                                        type: 'warning',
                                        message: `Proxy ${proxy} failed. Removing from list.`
                                    });

                                    globalConfig.proxy.list = globalConfig.proxy.list.filter((item: string) => item !== proxyStr);
                                }
                                throw new Error(`Proxy ${proxy} failed. Trying another proxy...`);
                            }
                        }
                        console.info("Creating SMTP transport");
                        logger.sendLog({type: 'warning', message: 'Creating SMTP transport'});
                        try {

                            const transporter = nodemailer.createTransport(
                                {...otherOptions,
                                    secure: SMTPOptions.port == 465,
                                    proxy, ...SMTPOptions,
                                    // @ts-ignore
                                    tls: {rejectUnauthorized: false, checkServerIdentity: () => null}});

                            if (globalConfig.proxy.useProxy && globalConfig.proxy.protocol == 'socks5') {
                                transporter.set('proxy_socks_module', require('socks'));
                            }
                            // @ts-ignore
                            transporter['usageCount'] = 0;
                            return transporter;
                        } catch (e: any) {
                            logger.sendLog({type: 'danger', message: e.message})
                            throw e
                        }

                    },
                    destroy: async (transporter: Transporter) => transporter.close(),
                },
                {max: globalConfig.workers});
        }
    }

    async acquire(): Promise<nodemailer.Transporter> {
        if (!this.pool) {
            throw new Error("SMTP pool not initialized.");
        }
        const transporter = await this.pool.acquire();

        // @ts-ignore
        if (transporter['usageCount'] >= 10) {
            console.info("Transporter usage limit reached, removing from pool");
            await this.pool.destroy(transporter);
            return this.acquire();
        }

        // @ts-ignore
        transporter['usageCount'] += 1;

        return transporter;
    }

    async release(transporter: Transporter) {
        await this.pool?.release(transporter);
    }

    static getInstance(SMTPOptions: SMTPConfig, globalConfig: MailerConfig): SMTPTransporterPool {
        if (!this.instance) {
            this.instance = new this(SMTPOptions, globalConfig);
        } else if (!deepEqual(this.instance.smtpOptions, SMTPOptions) || !deepEqual(this.instance.globalConfig, globalConfig)) {
            this.instance = new this(SMTPOptions, globalConfig);
        }
        return this.instance;
    }
}