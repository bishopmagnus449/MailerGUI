import {MailQueue} from '~/server/queues/mailQueue';
import {MailerConfig} from "~/src/types/types";
import {WebSocketLogger} from "~/utils/WebSocketLogger";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const smtp = body.smtp_list[0];
    const receivers: any[] = body.receivers;
    const config: MailerConfig = body.config;
    const queue = await MailQueue.setup(config);
    const logger = WebSocketLogger.getInstance();
    await queue.queue.drain();

    logger.sendLog({type: 'reset'})
    receivers.map(async (receiver: string) => await queue.queue.add('', {
        smtp,
        receiver: receiver.trim(),
        count: receivers.length,
        messages: body.messages,
        config,
    }))

    return { status: 'ok' };
})
