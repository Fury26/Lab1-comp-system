import { withBestProcessor } from './bestProcessor';
import { distributionProcessor } from './distributionProcessor';
import { ITask, IProcessor } from './enities';
import { fifoMethod } from './fifo';

export const initialProcessors: IProcessor[] = [
    {
        id: 0,
        flops: 400,
        isBusy: false,
        milliSecondsLeft: 0
    },
    {
        id: 1,
        flops: 1200,
        isBusy: false,
        milliSecondsLeft: 0
    },
    {
        id: 2,
        flops: 800,
        isBusy: false,
        milliSecondsLeft: 0
    },
    {
        id: 3,
        flops: 900,
        isBusy: false,
        milliSecondsLeft: 0
    },
    {
        id: 4,
        flops: 750,
        isBusy: false,
        milliSecondsLeft: 0
    }
];

const getRandomProcessors = (processors: IProcessor[], count: number): IProcessor[] => {
    const indexes: number[] = [];
    while (indexes.length < count) {
        let r = Math.floor(Math.random() * (processors.length - 1));
        if (indexes.indexOf(r) === -1) indexes.push(r);
    }

    const res = processors.filter((p) => indexes.indexOf(p.id) !== -1);
    return res;
};

const getMaxAndMin = (minFlops: number): number[] => {
    const maxComplexity = (minFlops / 10e2) * 30;
    const minComplexity = (minFlops / 10e2) * 3;

    return [minComplexity, maxComplexity];
};

/**
 * Return pool of tasks
 * @param poolSize the number of task in the pool.
 * @param min minimal complexity of the task.
 * @param max miximal complexity of the task.
 */
const generateTasks = (processors: IProcessor[], poolSize: number, min: number, max: number): ITask[] => {
    const tasks: ITask[] = [];

    for (let i = 0; i < poolSize; i++) {
        const count = Math.floor(Math.random() * (processors.length - 1)) + 1;
        tasks.push({
            id: i,
            complexity: min + Math.floor(Math.random() * (max - min)),
            processors: getRandomProcessors(processors, count)
        });
    }

    return tasks;
};

const clear = (processors: IProcessor[]) => {
    processors.forEach((p) => {
        p.isBusy = false;
        p.milliSecondsLeft = 0;
    });
};

export const runTask = (workers: IProcessor[]): ResultType => {
    let minFlops = Infinity;
    let maxFlops = 0;

    workers.forEach((w) => {
        if (w.flops < minFlops) minFlops = w.flops;
        if (w.flops > maxFlops) maxFlops = w.flops;
    });

    const [min, max] = getMaxAndMin(minFlops);

    const tasks = generateTasks(workers, 10000, min, max);

    let flopsSum = 0;

    for (const p of workers) {
        flopsSum += p.flops;
    }

    const avg = (max + min) / 2;
    const maxTasks = Math.floor((flopsSum / avg / 1000) * 10000);
    console.log(maxTasks);

    const fifo = fifoMethod(tasks, workers);
    clear(workers);

    const withSlowest = distributionProcessor(tasks, workers, minFlops);
    clear(workers);

    const withFastest = withBestProcessor(tasks, workers, maxFlops, 10);
    clear(workers);

    const effectiveWithFastest = withBestProcessor(tasks, workers, maxFlops, 2);
    clear(workers);


    

    return {
        fifo: {
            tasks: fifo,
            effeciency: +((fifo / maxTasks) * 100).toFixed(2),
        },
        withSlowest: {
            tasks: withSlowest,
            effeciency: +((withSlowest / maxTasks) * 100).toFixed(2),
        },
        withFastest: {
            tasks: withFastest,
            effeciency: +((withFastest / maxTasks) * 100).toFixed(2),
        },
        effectiveWithFastest: {
            tasks: effectiveWithFastest,
            effeciency: +((effectiveWithFastest / maxTasks) * 100).toFixed(2),
        }
    };
};

type Task = {
    tasks: number;
    effeciency: number;
};

export type ResultType = {
    fifo: Task;
    withSlowest: Task;
    withFastest: Task;
    [key: string]: Task;
};
