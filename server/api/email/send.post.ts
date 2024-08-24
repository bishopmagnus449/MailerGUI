import mailQueue from '~/server/queues/mailQueue';


export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const job = await mailQueue.add({
        smtp: body.smtp,
        receivers: body.receivers,
        message: body.message,
    });
    console.log("test")

    return { jobId: job.id };
})
