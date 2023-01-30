import { Configuration } from './Configuration';
import type { UserConfiguration } from './UserConfiguration';

const getString = function (value: unknown, defaultValue: string): string {
    const result = value || defaultValue;

    const stringValue = '' + result;
    if (stringValue.trim() === '') {
        return defaultValue;
    }

    return stringValue;
};

/**
 * Creates a sanitized configuration from user input.
 */
export function buildConfiguration(config: UserConfiguration): Configuration {
    const extractionMode = getString(config.extractionMode, 'regex');
    const inputValueProperty = getString(config.inputValueProperty, 'payload');
    const inputValueSource = getString(config.inputValueSource, 'msg');
    const extractionRegexpPattern = getString(config.extractionRegexpPattern, '(.*)');
    const extractionRegexpFlags = config.extractionRegexpFlags || [];
    const extractionSplitSeparator = getString(config.extractionSplitSeparator, '');
    const outputMapping = config.outputMapping || [];

    return new Configuration(extractionMode, inputValueProperty, inputValueSource, extractionRegexpPattern, extractionRegexpFlags, extractionSplitSeparator, outputMapping);
}
