import 'reflect-metadata';
import { Container } from 'inversify';
import { connect, connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TYPES } from '../src/dependency-injection/types';
import UserRepository from '../src/infrastructure/persistence/mongo/user/user-mongo-repository';
import PasswordManager from '../src/infrastructure/password/bcrypt-adapter';
import { EventEmitter } from 'events';
import express from 'express';

let mongoServer: MongoMemoryServer;
const container = new Container();

beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await connect(mongoUri);

    // Configure container with real implementations
    container.bind(TYPES.IUserRepository).to(UserRepository);
    container.bind(TYPES.IPasswordManager).to(PasswordManager);
    container.bind(TYPES.EventEmmiter).toConstantValue(new EventEmitter());
});

afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear database between tests
    const collections = connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Create test app
import { myContainer } from '../src/dependency-injection/inversify.config';
import { EventHandlers } from '../src/events/event-handlers';
import ISetupDb from '../src/infrastructure/setup/contracts/setup-db.contract';
import ISetupRefreshTokenStore from '../src/infrastructure/setup/contracts/refresh-token-store.contract';
import logger from '../src/helpers/logger';

// configure event handlers
const eventHandlers = myContainer.get(EventHandlers);
eventHandlers.registerEventHandlers();
logger.info(`Selected setup: ${process.env.SELECTED_SETUP}`)
// setup db
const setupDb = myContainer.get<ISetupDb>(TYPES.ISetupDb);

// setup refresh token store
const setupRefreshTokenStore = myContainer.get<ISetupRefreshTokenStore>(TYPES.ISetupRefreshTokenStore);

const app = express();

const setup = async () => {
    try {
        await setupDb.setup();
        await setupRefreshTokenStore.setup();
        if (!process.env.CREATE_ACCOUNT_URL) {
            process.env.CREATE_ACCOUNT_URL = `http://localhost:${process.env.AUTH_PORT || 3000}`;
        }
        if (!process.env.RESET_PASSWORD_URL) {
            process.env.RESET_PASSWORD_URL = `http://localhost:${process.env.AUTH_PORT || 3000}`;
        }

        await require('../src/api/loaders').default({ expressApp: app });
       
    } catch (error) {
        logger.error(error);
    }
}

setup();

export { container, app, myContainer };