export interface IProcessor {
    id: number;
    // ! operations in second
    flops: number;
    isBusy: boolean;
    milliSecondsLeft: number;
}

export interface ITask {
    id: number;
    complexity: number;
    processors: IProcessor[];
}