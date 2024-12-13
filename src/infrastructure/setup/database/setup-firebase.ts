import { injectable } from "inversify";
import ISetupDb from "../contracts/setup-db.contract";
import * as admin from 'firebase-admin';

const serviceAccount = require('../../../../cuca-firebase.json');

@injectable()
export default class SetupDbFirebase implements ISetupDb {
    async setup(): Promise<void> {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        console.log('Firebase initialized');
    }
}