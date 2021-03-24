import React, { useState } from 'react';
import { IProcessor } from './tasks/enities';
import { initialProcessors, ResultType, runTask } from './tasks/main';

type State = {
    processors: IProcessor[];
    result: ResultType;
};

const App: React.FC = () => {
    const [state, setState] = useState<State>({
        processors: initialProcessors,
        result: {
            fifo: {
                tasks: 0,
                effeciency: 0
            },
            withSlowest: {
                tasks: 0,
                effeciency: 0
            },
            withFastest: {
                tasks: 0,
                effeciency: 0
            },
            effectiveWithFastest: {
                tasks: 0,
                effeciency: 0
            }
        }
    });

    const runTaskHandler = () => {
        const result = runTask(state.processors);
        setState((prev) => ({
            ...prev,
            result: result
        }));
    };

    const inputFloops = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        setState((prev) => ({
            ...prev,
            processors: prev.processors.map((p: IProcessor) => {
                if (p.id === id) {
                    p.flops = +e.target.value;
                }
                return p;
            })
        }));
    };

    return (
        <div className="container p-5">
            {state.processors.map((p) => {
                return (
                    <div key={p.id} className="mb-3 input-group">
                        <label className="input-group-text" htmlFor={'#' + p.id}>
                            Processor #{p.id}
                        </label>
                        <input
                            id={p.id.toString()}
                            type="number"
                            className="form-control"
                            min={-1}
                            value={p.flops}
                            onChange={(e) => inputFloops(e, p.id)}
                        />
                    </div>
                );
            })}
            <button className="btn btn-info" onClick={runTaskHandler}>
                Run methods
            </button>

            {Object.keys(state.result).map((key) => {
                return (
                    <div key={key} className="pt-3">
                        <label htmlFor={'#' + key} className="form-label">
                            {key} method
                        </label>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id={'done' + key}>
                                Tasks done: {state.result[key].tasks}
                            </span>
                            <span className="input-group-text" id={key}>
                                Effeciency: {state.result[key].effeciency}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default App;
