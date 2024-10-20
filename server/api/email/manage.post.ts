import {MailQueue} from '~/server/queues/mailQueue';
import {WebSocketLogger} from "~/utils/WebSocketLogger";


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const queue = MailQueue.getInstance();
    const logger = WebSocketLogger.getInstance();

    if (!queue) {
        return {status: false, error: 'No running Mail Queue found.'}
    }

    if (body.method === 'pause') {
        if(await queue.queue.isPaused()) {
            console.log('Queue is paused')
            return {status: false, error: 'ALREADY_PAUSED'};
        }

        logger.sendLog({type: 'warning', message: 'Sending new emails paused...'})
        await queue.queue.pause();
    }
    else if (body.method === 'resume') {
        if(!await queue.queue.isPaused()) {
            return {status: false, error: 'ALREADY_RUNNING'};
        }
        logger.sendLog({type: 'warning', message: 'Sending new emails resumed...'})
        await queue.queue.resume();
    }
    else if (body.method === 'stop') {
        logger.sendLog({type: 'warning', message: 'Sending new emails stopped, cleared sending queue...'})
        await queue.queue.close();
        await queue.queue.drain();
    }
    else {
        return {status: false, error: 'Invalid method'};

    }
    return {status: 'ok'}
})