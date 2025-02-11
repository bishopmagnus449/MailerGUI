import {MailQueue} from '~/server/queues/mailQueue';

export default defineEventHandler(async (event) => {
    const queue = MailQueue.getInstance();
    const debugMode = (String(process.env.DEBUG_MODE) === 'true');

    if (queue) {
        const waitingCount = await queue.queue.getWaitingCount();
        const activeCount = await queue.queue.getActiveCount();

        return {
            queueRunning: !await queue.queue.isPaused(),
            workerRunning: queue.worker.isRunning(),
            remainingCount: waitingCount + activeCount,
            waitingCount,
            activeCount,
            debugMode,
        }
    }
    return {queueRunning: false, debugMode}
})