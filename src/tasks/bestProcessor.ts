import { IProcessor, ITask } from './enities';

export const withBestProcessor = (pool: ITask[], processors: IProcessor[], max: number, frequency: number) => {
    let milliSeconnds = 0;
    let completed = 0;
    let i = 0;

    const distributor = processors.filter((p) => p.flops === max)[0];

    while (milliSeconnds < 10e3) {
        processors.forEach((p) => p.milliSecondsLeft--);
        // eslint-disable-next-line no-loop-func
        processors.forEach((p) => {
            if (p.milliSecondsLeft <= 0 && p.isBusy) {
                p.isBusy = false;
                completed++;
            }
        });

        // if (true) {
        if (milliSeconnds % frequency === 0) {
            while (true) {
                const task = pool[i];
                const procID = getProcForTask(
                    task,
                    processors.filter((p) => !p.isBusy),
                    distributor.id
                );
                if (procID === -1) {
                    break;
                }

                if (i === pool.length - 1) {
                    i = 0;
                } else {
                    i++;
                }
                processors.forEach((p) => {
                    if (p.id === procID) {
                        p.milliSecondsLeft = (task.complexity / p.flops) * 10e2;
                        p.isBusy = true;
                    }
                });
            }
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

    if (task.processors.length === 1) {
        return task.processors[0].id;
    } else {
        let max = -Infinity;
        task.processors.forEach((p) => {
            if (p.flops > max && !p.isBusy) max = p.flops;
        });
        return task.processors.filter((p) => p.flops === max && !p.isBusy)[0].id;
    }
};
