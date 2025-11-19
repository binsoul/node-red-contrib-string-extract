import { MessageHandler } from '@binsoul/node-red-bundle-processing';
import type { Node, NodeInitializer } from 'node-red';
import { ActionFactory } from './ActionFactory.js';
import { buildConfiguration } from './ConfigurationBuilder.js';
import type { UserConfiguration } from './UserConfiguration.js';

const nodeInitializer: NodeInitializer = (RED): void => {
    function NodeConstructor(this: Node, userConfiguration: UserConfiguration): void {
        RED.nodes.createNode(this, userConfiguration);

        const configuration = buildConfiguration(userConfiguration);
        const actionFactory = new ActionFactory(RED, this, configuration);
        const messageHandler = new MessageHandler(RED, this, actionFactory);

        this.on('input', (msg, send, done) => messageHandler.handle(msg, send, done));
    }

    RED.nodes.registerType('binsoul-string-extract', NodeConstructor);
};

export = nodeInitializer;
