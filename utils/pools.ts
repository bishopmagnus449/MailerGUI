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

    constructor(SMTPOptions?: SMTPConfig, globalConfig?: MailerConfig) {
        this.smtpOptions = SMTPOptions;
        if (SMTPOptions && globalConfig) {
            this.setup(SMTPOptions, globalConfig);
        }
    }

    setup(SMTPOptions: SMTPConfig, globalConfig: MailerConfig) {

        if (!this.pool) {
            console.info('Initializing SMTP pool');
            logger.sendLog({type: 'warning', message: 'Initializing SMTP pool'});
            let proxy = undefined;
            if (globalConfig.proxy.useProxy) {
                const proxyStr = getRandomMember(globalConfig.proxy.list)
                proxy = `${globalConfig.proxy.protocol}://${proxyStr}`
            }

            this.pool = GenericPool.createPool({
                    create: async () => {
                        console.info("Creating SMTP transport");
                        logger.sendLog({type: 'warning', message: 'Creating SMTP transport'});
                        try {
                            let otherOptions: {[key: string]: any} = {};
                            if (SMTPOptions.user && SMTPOptions.pass) {
                                otherOptions.auth = {user: SMTPOptions.user, pass: SMTPOptions.pass}
                            }
                            const transporter =  nodemailer.createTransport({...otherOptions, secure: SMTPOptions.port == 465, proxy, ...SMTPOptions, tls: {rejectUnauthorized: false, checkServerIdentity: () => { return null; }}});
                            if (globalConfig.proxy.useProxy && globalConfig.proxy.protocol == 'socks5') {
                                transporter.set('proxy_socks_module', require('socks'));
                            }
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

    async acquire() {
        if (!this.pool) {
            throw new Error("SMTP pool not initialized.");
        }
        return await this.pool.acquire();
    }

    async release(transporter: Transporter) {
        await this.pool?.release(transporter);
    }

    static getInstance(SMTPOptions: SMTPConfig, globalConfig: MailerConfig): SMTPTransporterPool {
        if (!this.instance) {
            this.instance = new this(SMTPOptions, globalConfig);
        } else if (!deepEqual(this.instance.smtpOptions, SMTPOptions)) {
            this.instance = new this(SMTPOptions, globalConfig);
        }
        return this.instance;
    }
}