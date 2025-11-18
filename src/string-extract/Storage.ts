import { Message } from '@binsoul/node-red-bundle-processing';

/**
 * Stores messages and extracted data.
 */
export class Storage {
    private data: Array<{ message: Message; data: Array<unknown> }> = [];

    public getMessage(): Message | null {
        const result = this.data.pop();
        if (typeof result === 'undefined') {
            return null;
        }

        this.data.push(result);

        return result.message;
    }

    public popData(): Array<unknown> | null {
        const result = this.data.pop();
        if (typeof result === 'undefined') {
            return null;
        }

        return result.data;
    }

    public addMessageData(message: Message, data: Array<unknown>) {
        this.data.unshift({
            message,
            data,
        });
    }
}
