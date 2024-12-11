if (process.env.NODE_ENV !== 'production') {
    import('dotenv').then(dotenv => {
        dotenv.config();
    });
}
import 'reflect-metadata';
import startServer from './api/server';
import { myContainer } from './dependency-injection/inversify.config';
import { TYPES } from './dependency-injection/types';
import { EventHandlers } from './events/event-handlers';
import { EventEmitter } from 'events';



// configure event handlers
const eventHandlers = myContainer.get(EventHandlers);
eventHandlers.registerEventHandlers();

//const eventEmitter = myContainer.get<EventEmitter>(TYPES.EventEmmiter);
//eventEmitter.emit('CreateUserSendEmail', { email: 'fasdfdas@fasdfsa.com' });

startServer();