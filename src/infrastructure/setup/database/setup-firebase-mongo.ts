import * as admin from 'firebase-admin';
import { injectable } from 'inversify';
import ISetupDb from '../contracts/setup-db.contract';
import mongoose from 'mongoose';

const serviceAccount = require('../../../../config-firebase.json');

@injectable()
export default class SetupDbFirebaseMongo implements ISetupDb {
    async setup(): Promise<void> {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });

            const uri = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/';
            await mongoose.connect(uri);
            console.log('Firebase and Mongo initialized');
        } catch (error) {
            console.error('Error setting up firebase with mongo database');
            throw new Error('Error setting up firebase mongo database');
        }
    }
}