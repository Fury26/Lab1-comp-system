import { IProcessor, ITask } from './enities';

const TIME = 10e3;

export const fifoMethod = (pool: ITask[], processors: IProcessor[]) => {
    let milliSeconnds = 0;
    let completed = 0;
    let i = 0;

    



    while (milliSeconnds < TIME) {
        processors.forEach((p) => p.milliSecondsLeft--);
        // eslint-disable-next-line no-loop-func
        processors.forEach((p) => {
            if (p.milliSecondsLeft <= 0 && p.isBusy) {
                p.isBusy = false;
                completed++;
            }
        });
        

        if (milliSeconnds % 4 === 0) {
            const newTask = pool[i];
            let found = false;
            newTask.processors.forEach((p) => {
                if (p.isBusy || found) return;
                p.milliSecondsLeft = (newTask.complexity / p.flops) * 10e2;
                p.isBusy = found = true;
            });

            if (found) {
                if (i === pool.length - 1) {
                    i = 0;
                } else {
                    i++;
                }
            }
        }

        milliSeconnds += 1;
    }
    

    return completed;
};
