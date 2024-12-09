import 'reflect-metadata';
import startServer from './api/server';
import dotenv from 'dotenv';
import { myContainer } from './dependency-injection/inversify.config';
import { TYPES } from './dependency-injection/types';
import { EventHandlers } from './events/event-handlers';
import { EventEmitter } from 'events';

dotenv.config();

// configure event handlers
const eventEmitter = myContainer.get<EventEmitter>(TYPES.EventEmmiter);
const eventHandlers = new EventHandlers(eventEmitter);
eventHandlers.registerEventHandlers();

startServer();