import 'reflect-metadata';
import startServer from './api/server';
import dotenv from 'dotenv';

dotenv.config();

startServer();