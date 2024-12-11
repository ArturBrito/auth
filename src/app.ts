if (process.env.NODE_ENV !== 'production') {
    import('dotenv').then(dotenv => {
        dotenv.config();
    });
}
import 'reflect-metadata';
import startServer from './api/server';
import { myContainer } from './dependency-injection/inversify.config';
import { EventHandlers } from './events/event-handlers';
import { TYPES } from './dependency-injection/types';
import ISetupDb from './infrastructure/persistence/setup/setup-db.contract';

// configure event handlers
const eventHandlers = myContainer.get(EventHandlers);
eventHandlers.registerEventHandlers();

// setup db
const setupDb = myContainer.get<ISetupDb>(TYPES.ISetupDb);


setupDb.setup().then(() => {
    startServer();
});