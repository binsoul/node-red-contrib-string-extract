import { Action, Input, InputDefinition, Output, OutputDefinition } from '@binsoul/node-red-bundle-processing';
import jsonata from 'jsonata';
import type { Configuration } from '../Configuration';

interface Context {
    values: string[];
    [key: string]: string | string[];
}

export class ExtractAction implements Action {
    private readonly configuration: Configuration;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
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
        const result = new OutputDefinition();

        let index = 1;
        for (const output of this.configuration.outputMapping) {
            result.set('output' + index, {
                target: output.outputTarget,
                property: output.outputProperty,
                type: 'unknown',
                channel: 0,
            });

            index++;
        }

        return result;
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

        index = 1;
        for (const output of this.configuration.outputMapping) {
            result.setValue('output' + index, this.evaluate(output.valueSource, output.valueProperty, context));

            index++;
        }

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

    private evaluate(type: string, value: string, context: Context): unknown {
        let result: unknown = value;

        if (type === 'match') {
            result = context['value' + Number(value)] || null;
        } else if (type === 'matches') {
            result = context.values || [];
        } else if (type === 'str') {
            result = '' + value;
        } else if (type === 'num') {
            result = Number(value);
        } else if (type === 'json') {
            result = JSON.parse(value);
        } else if (type === 'date') {
            result = Date.now();
        } else if (type === 'bool') {
            result = /^true$/i.test(value);
        } else if (type === 'jsonata') {
            const expr = jsonata(value);
            result = expr.evaluate(context);
        }

        return result;
    }
}
