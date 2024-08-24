export async function promisePool<T>(
    items: T[],
    concurrency: number,
    task: (item: T) => Promise<void>,
    timeout: number
): Promise<void> {
    const pool: Promise<void>[] = [];
    let currentIndex = 0;

    const runTask = async (item: T) => {
        const taskWithTimeout = new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Task timed out')), timeout);

            task(item)
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });

        await taskWithTimeout;
    };

    const enqueue: () => (Promise<void>) = () => {
        if (currentIndex === items.length) {
            return Promise.resolve();
        }

        const item = items[currentIndex++];
        const taskPromise: Promise<any> = runTask(item).then(() => pool.splice(pool.indexOf(taskPromise), 1));
        pool.push(taskPromise);

        const nextTask = pool.length >= concurrency ? Promise.race(pool) : Promise.resolve();
        return nextTask.then(enqueue);
    };

    return enqueue();
}
