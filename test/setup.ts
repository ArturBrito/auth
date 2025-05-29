import 'reflect-metadata';
import { Container } from 'inversify';
import { connect, connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TYPES } from '../src/dependency-injection/types';
import UserRepository from '../src/infrastructure/persistence/mongo/user/user-mongo-repository';
import PasswordManager from '../src/infrastructure/password/bcrypt-adapter';
import { EventEmitter } from 'events';
import express from 'express';
import { json } from 'body-parser';
import authRoute from '../src/api/routes/auth-route';
import userRoute from '../src/api/routes/user-route';

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
const app = express();
app.use(json());
authRoute(app);
userRoute(app);

export { app, container };