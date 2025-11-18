import { Action, InputDefinition, Output, OutputDefinition } from '@binsoul/node-red-bundle-processing';
import type { Configuration } from '../Configuration';
import { Storage } from '../Storage';

export class OutputAction implements Action {
    private readonly configuration: Configuration;
    private storage: Storage;

    constructor(configuration: Configuration, storage: Storage) {
        this.configuration = configuration;
        this.storage = storage;
    }

    defineInput(): InputDefinition {
        return new InputDefinition();
    }

    defineOutput(): OutputDefinition {
        const result = new OutputDefinition();

        const message = this.storage.getMessage();
        if (message === null) {
            return result;
        }

        let index = 1;
        for (const output of this.configuration.outputMapping) {
            result.set('output' + index, {
                target: output.outputTarget,
                property: output.outputProperty,
                type: 'unknown',
                channel: 0,
                message: message.data,
            });

            index++;
        }

        return result;
    }

    execute(): Output {
        const result = new Output();

        const data = this.storage.popData();
        if (data !== null) {
            let index = 1;
            for (const value of data) {
                result.setValue('output' + index, value);

                index++;
            }
        }

        return result;
    }
}
