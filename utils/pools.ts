import nodemailer, {type Transporter} from "nodemailer";
import GenericPool from "generic-pool";
import type SMTPTransport from "nodemailer/lib/smtp-transport";


export class SMTPTransporterPool {
    private pool: GenericPool.Pool<Transporter>;

    constructor(SMTPOptions: SMTPTransport.Options, max = 10) {
        this.pool = GenericPool.createPool({
                create: async () => {
                    console.info("Creating SMTP transport");
                    return nodemailer.createTransport(SMTPOptions);
                },
                destroy: async (transporter: Transporter) => transporter.close(),
            },
            {max});
    }

    async acquire() {
        return await this.pool.acquire();
    }

    async release(transporter: Transporter) {
        await this.pool.release(transporter);
    }
}
