import Queue from 'bull';
import {promisePool} from '~/utils/promises';
import {SMTPTransporterPool} from "~/utils/pools";


// @ts-ignore
const mailQueue = new Queue('mailQueue', {redis: {host: 'localhost', port: '6379'}});


mailQueue.process(async (job) => {
    const {smtp, receivers, message, concurrency, timeout} = job.data;
    const transporterPool = new SMTPTransporterPool(smtp, 10)

    await promisePool(
        receivers,
        concurrency || 10,
        async (receiver: string) => {
            console.log('Sending to: ' + receiver)
            const transporter = await transporterPool.acquire();
            try {
                await transporter.sendMail({
                    from: smtp.from,
                    to: receiver,
                    subject: message.subject,
                    text: message.text,
                    html: message.html,
                });
                console.log('Sent: ' + receiver)
            } catch (e) {
                console.error(e)
            } finally {
                await transporterPool.release(transporter);
            }
        },
        timeout || 30000
    );
});

export default mailQueue;
