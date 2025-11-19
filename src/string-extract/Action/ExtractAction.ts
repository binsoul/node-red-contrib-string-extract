import { Action, Input, InputDefinition, Output, OutputDefinition } from '@binsoul/node-red-bundle-processing';
import jsonata from 'jsonata';
import type { Configuration } from '../Configuration.js';
import { Storage } from '../Storage.js';

interface Context {
    values: string[];

    [key: string]: string | string[];
}

export class ExtractAction implements Action {
    private readonly configuration: Configuration;
    private readonly storage: Storage;
    private readonly outputCallback: () => void;

    constructor(configuration: Configuration, storage: Storage, outputCallback: () => void) {
        this.configuration = configuration;
        this.storage = storage;
        this.outputCallback = outputCallback;
    }

    defineInput(): InputDefinition {
        const result = new InputDefinition();

        result.set('value', {
            source: this.configuration.inputValueSource,
            property: this.configuration.inputValueProperty,
            type: 'string',
            required: true,
        });

        return result;
    }

    defineOutput(): OutputDefinition {
        return new OutputDefinition();
    }

    execute(input: Input): Output {
        const result = new Output();

        const inputValue = input.getRequiredValue<string>('value');

        let matches;
        switch (this.configuration.extractionMode) {
            case 'split':
                matches = this.extractSplit(inputValue);

                break;
            case 'regexp':
            default:
                matches = this.extractRegExp(inputValue);
        }

        if (matches === null) {
            return result;
        }

        const context: Context = {
            values: matches,
        };

        let index = 1;
        for (const match of matches) {
            context['value' + index] = match;

            index++;
        }

        const promises: Array<Promise<unknown>> = [];
        for (const output of this.configuration.outputMapping) {
            promises.push(this.evaluate(output.valueSource, output.valueProperty, context));
        }

        Promise.all(promises).then((values) => {
            this.storage.addMessageData(input.getMessage(), values);
            this.outputCallback();
        });

        result.setNodeStatus('');

        return result;
    }

    private extractRegExp(inputValue: string): Array<string> | null {
        const regexp = new RegExp(this.configuration.extractionRegexpPattern, this.configuration.extractionRegexpFlags.join(''));

        const matches = regexp.exec(inputValue);
        if (matches === null) {
            return null;
        }

        const result = [...matches];
        result.shift();

        return result;
    }

    private extractSplit(inputValue: string): Array<string> | null {
        return inputValue.split(this.configuration.extractionSplitSeparator);
    }

    private evaluate(type: string, value: string, context: Context): Promise<unknown> {
        let result: Promise<unknown> = new Promise((resolve) => resolve(value));

        if (type === 'match') {
            result = new Promise((resolve) => resolve(context['value' + Number(value)] || null));
        } else if (type === 'matches') {
            result = new Promise((resolve) => resolve(context.values || []));
        } else if (type === 'str') {
            result = new Promise((resolve) => resolve('' + value));
        } else if (type === 'num') {
            result = new Promise((resolve) => resolve(Number(value)));
        } else if (type === 'json') {
            result = new Promise((resolve) => resolve(JSON.parse(value)));
        } else if (type === 'date') {
            result = new Promise((resolve) => resolve(Date.now()));
        } else if (type === 'bool') {
            result = new Promise((resolve) => resolve(/^true$/i.test(value)));
        } else if (type === 'jsonata') {
            const expr = jsonata(value);
            const evaluated = expr.evaluate(context);

            if (evaluated instanceof Promise) {
                result = evaluated;
            } else {
                result = new Promise((resolve) => resolve(evaluated));
            }
        }

        return result;
    }
}
