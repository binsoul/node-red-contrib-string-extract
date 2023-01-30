import { Action, ActionFactory as ActionFactoryInterface } from '@binsoul/node-red-bundle-processing';
import type { Node, NodeAPI } from '@node-red/registry';
import { ExtractAction } from './Action/ExtractAction';
import type { Configuration } from './Configuration';

/**
 * Generates actions.
 */
export class ActionFactory implements ActionFactoryInterface {
    private readonly configuration: Configuration;
    private readonly RED: NodeAPI;
    private readonly node: Node;

    constructor(RED: NodeAPI, node: Node, configuration: Configuration) {
        this.RED = RED;
        this.node = node;
        this.configuration = configuration;
    }

    build(): Action | Array<Action> | null {
        return new ExtractAction(this.configuration);
    }
}
