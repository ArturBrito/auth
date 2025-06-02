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
import logger from './helpers/logger';

// configure event handlers
const eventHandlers = myContainer.get(EventHandlers);
eventHandlers.registerEventHandlers();
logger.info(`Selected setup: ${process.env.SELECTED_SETUP}`)

// setup db
const setupDb = myContainer.get<ISetupDb>(TYPES.ISetupDb);

// setup refresh token store
const setupRefreshTokenStore = myContainer.get<ISetupRefreshTokenStore>(TYPES.ISetupRefreshTokenStore);




const setup = async () => {
    try {
        await setupDb.setup();
        await setupRefreshTokenStore.setup();
        // check if CREATE_ACCOUNT_URL is set otherwise set default
        if (!process.env.CREATE_ACCOUNT_URL) {
            process.env.CREATE_ACCOUNT_URL = `http://localhost:${process.env.AUTH_PORT || 3000}`;
        }
        if (!process.env.RESET_PASSWORD_URL) {
            process.env.RESET_PASSWORD_URL = `http://localhost:${process.env.AUTH_PORT || 3000}`;
        }
        startServer();
    } catch (error) {
        logger.error(error);
    }
}

setup();