/**
 * Stores events and a history of past events.
 */
export class Storage {
    private data: Array<unknown> = [];

    public getData(): Array<unknown> {
        return this.data;
    }

    public setData(data: Array<unknown>) {
        this.data = data;
    }
}
