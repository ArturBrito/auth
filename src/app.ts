if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
import 'reflect-metadata';
import startServer from './api/server';
import { myContainer } from './dependency-injection/inversify.config';
import { EventHandlers } from './events/event-handlers';
import { TYPES } from './dependency-injection/types';
import ISetupDb from './infrastructure/setup/contracts/setup-db.contract';
import ISetupRefreshTokenStore from './infrastructure/setup/contracts/refresh-token-store.contract';

// configure event handlers
const eventHandlers = myContainer.get(EventHandlers);
eventHandlers.registerEventHandlers();

// setup db
const setupDb = myContainer.get<ISetupDb>(TYPES.ISetupDb);

// setup refresh token store
const setupRefreshTokenStore = myContainer.get<ISetupRefreshTokenStore>(TYPES.ISetupRefreshTokenStore);




const setup = async () => {
    try {
        await setupDb.setup();
        await setupRefreshTokenStore.setup();
        // check if ACTION_URL is set otherwise set default
        if (!process.env.ACTION_URL) {
            process.env.ACTION_URL = 'http://localhost:3000';
        }
        startServer();
    } catch (error) {
        console.log(error);
    }
}

setup();