import {Queue, Worker, Job} from 'bullmq';
import IORedis from 'ioredis';
import {MessagePreparer} from '~/utils/DataGenerator';
import {MailerConfig, SMTPConfig, Message} from "~/src/types/types";
import {WebSocketLogger} from "~/utils/WebSocketLogger";
import {SMTPTransporterPool} from "~/utils/pools";
import random from 'random'

const sleep = (i: number) => new Promise (resolve => setTimeout(resolve, i))
const logger = WebSocketLogger.getInstance();

export class MailQueue {
    public queue: Queue;
    public worker: Worker;
    private static instance: MailQueue;
    public progress: number;

    private constructor(private config: MailerConfig) {
        const connection = new IORedis({host: 'localhost', port: 6379, maxRetriesPerRequest: null});
        this.queue = new Queue('mailQueue', {connection, defaultJobOptions: {removeOnComplete: true}});
        this.worker = new Worker('mailQueue', processEmail, {connection, concurrency: this.config.workers});
        this.progress = 1;

        logger.sendLog({type: 'progress', message: this.progress})

        this.worker.on('completed', (job) => {
            logger.sendLog({type: 'success', message: `[${this.progress} / ${job.data.count}] ` + 'Sent: ' + job.data.receiver});
            logger.sendLog({type: 'progress', message: Math.floor(this.progress / job.data.count * 100)})

            console.log([this.progress], 'Sent: ' + job.data.receiver);
            // logger.sendLog({type: 'info', message: {counter: this.progress, count: job.data.count}})
            this.progress++;
        })

        this.worker.on('failed', (job, error) => {
            console.log('Error: ' + job?.data.receiver, error);
        })

        this.worker.on('paused', () => {

            logger.sendLog({type: 'progress', message: undefined});
        })

        this.worker.on('resumed', () => {
            logger.sendLog({type: 'info', message: 'Worker resumed...'})
            logger.sendLog({type: 'progress', message: this.progress});
        });

        this.worker.on('closed', () => {
            logger.sendLog({type: 'danger', message: 'Sending Stopped.'})
            logger.sendLog({type: 'progress', message: undefined});
        })

    }

    static async setup(config: MailerConfig) {
        const instance = new this(config);
        instance.progress = 1;
        this.instance = instance;
        return instance;

    }

    static getInstance(){
        return this.instance;
    }

}

async function processEmail (job: Job)  {
    const {smtp, receiver, messages, config}: {smtp: SMTPConfig, receiver: string, messages: Message[], config: MailerConfig} = job.data;

    await sendEmail(smtp, receiver, messages, config)

    // todo: debugging...
    const i = Math.floor(Math.random() * (1000 - 3000)) + Math.ceil(1000);
    await job.updateData({i, ...job.data})
    await sleep(i)
    // await sendEmail(smtp, receiver, messages)
}

async function sendEmail (smtp: SMTPConfig, receiver: string, messages: Message[], config: MailerConfig) {
    logger.sendLog({type: 'log', message: 'Sending to: ' + receiver});
    // const transporterPool = SMTPTransporterPool.getInstance(smtp, config.workers);
    // const transporter = await transporterPool.acquire();
    // console.info('Available', transporterPool.pool.available);
    // console.info('borrowed', transporterPool.pool.borrowed);

    try {
        for (let message of messages) {
            const preparer = await MessagePreparer.setup(message, smtp, receiver, config)
            const email = {
                from: smtp.from,
                to: receiver,
                subject: preparer.subject,
                text: preparer.text,
                html: preparer.html,
                attachments: preparer.attachments,
            }
            // console.info(email);
            // await transporter.sendMail(email)
        }
    } catch (e) {
        console.error(e)
    } finally {
        // await transporterPool.release(transporter);
    }
}