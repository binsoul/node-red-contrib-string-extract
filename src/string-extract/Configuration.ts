import { MappedOutput } from './MappedOutput.js';

/**
 * Sanitized configuration generated from user input.
 */
export class Configuration {
    extractionMode: string;
    inputValueProperty: string;
    inputValueSource: string;
    extractionRegexpPattern: string;
    extractionRegexpFlags: string[];
    extractionSplitSeparator: string;
    outputMapping: Array<MappedOutput>;

    constructor(
        extractionMode = 'regexp',
        inputValueProperty = 'payload',
        inputValueSource = 'msg',
        extractionRegexpPattern = '(.*)',
        extractionRegexpFlags: string[] = [],
        extractionSplitSeparator = '',
        outputMapping: Array<MappedOutput> = [],
    ) {
        this.extractionMode = extractionMode;
        this.inputValueProperty = inputValueProperty;
        this.inputValueSource = inputValueSource;
        this.extractionRegexpPattern = extractionRegexpPattern;
        this.extractionRegexpFlags = extractionRegexpFlags;
        this.extractionSplitSeparator = extractionSplitSeparator;
        this.outputMapping = outputMapping;
    }
}
