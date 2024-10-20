import nodemailer, {type Transporter} from "nodemailer";
import GenericPool from "generic-pool";
import {SMTPConfig} from "~/src/types/types";
import {WebSocketLogger} from "~/utils/WebSocketLogger";

const logger = WebSocketLogger.getInstance();

export class SMTPTransporterPool {
    private pool?: GenericPool.Pool<Transporter>;
    private static instance: SMTPTransporterPool;

    constructor(SMTPOptions?: SMTPConfig, max = 10) {
        if (SMTPOptions) {
            this.setup(SMTPOptions, max);
        }
    }

    setup(SMTPOptions: SMTPConfig, max: number) {

        if (!this.pool) {
            console.info('Initializing SMTP pool');
            logger.sendLog({type: 'warning', message: 'Initializing SMTP pool'});
            this.pool = GenericPool.createPool({
                    create: async () => {
                        console.info("Creating SMTP transport");
                        logger.sendLog({type: 'warning', message: 'Creating SMTP transport'});
                        return nodemailer.createTransport({auth: {user: SMTPOptions.user, pass: SMTPOptions.pass}, ...SMTPOptions});
                    },
                    destroy: async (transporter: Transporter) => transporter.close(),
                },
                {max});
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

    static getInstance(SMTPOptions: SMTPConfig, max = 10): SMTPTransporterPool {
        if (!this.instance) {
            this.instance = new this(SMTPOptions, max);
        }
        return this.instance;
    }
}