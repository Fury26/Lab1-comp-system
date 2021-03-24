import { IProcessor, ITask } from './enities';

export const distributionProcessor = (pool: ITask[], processors: IProcessor[], min: number) => {
    let milliSeconnds = 0;
    let completed = 0;
    let i = 0;

    const distributor = processors.filter((p) => p.flops === min)[0];

    // console.log(processors);

    const workers = processors.filter((p) => p.id !== distributor.id);

    const tasks = pool.filter(t => {
        return t.processors.length === 1 && t.processors[0].id === distributor.id ? false : true;
    });
    let tasksgeven = 0;

    while (milliSeconnds < 10e3) {
        workers.forEach((p) => p.milliSecondsLeft--);
        workers.forEach((p) => {
            if (p.milliSecondsLeft <= 0 && p.isBusy) {
                p.isBusy = false;
                completed++;
            }
        });

        // if (true) {
        while (true) {
            const task = tasks[i];
            const procID = getProcForTask(
                task,
                workers.filter((p) => !p.isBusy),
                distributor.id
            );
            if (procID === -1) {
                break;
            }

            if (i === tasks.length - 1) {
                i = 0;
            } else {
                i++;
            }
            workers.forEach((p) => {
                if (p.id === procID) {
                    tasksgeven++;
                    p.milliSecondsLeft = (task.complexity / p.flops) * 10e2;
                    p.isBusy = true;
                }
            });
        }

        milliSeconnds++;
    }

    

    return completed;
};

const getProcForTask = (task: ITask, processors: IProcessor[], id: number): number => {
    if (processors.length === 0) return -1;

    let found = false;

    task.processors.forEach((p) => {
        processors.forEach((proc) => {
            if (proc.id === p.id) found = true;
        });
    });

    if (!found) return -1;

    if (task.processors.length === 1 && task.processors[0].id !== id) {
        return task.processors[0].id;
    } else {
        let max = -Infinity;
        task.processors.forEach((p) => {
            if (p.flops > max && p.id !== id && !p.isBusy) max = p.flops;
        });
        return task.processors.filter((p) => p.flops === max && !p.isBusy)[0].id;
    }
};
