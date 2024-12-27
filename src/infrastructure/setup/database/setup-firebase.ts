import { injectable } from "inversify";
import ISetupDb from "../contracts/setup-db.contract";
import * as admin from "firebase-admin";

let serviceAccount: any;

try {
    serviceAccount = require("../../../../config-firebase.json");
} catch (error) {
    console.warn("config-firebase.json not found. Firebase setup will be skipped.");
}

@injectable()
export default class SetupDbFirebase implements ISetupDb {
    async setup(): Promise<void> {
        if (!serviceAccount) {
            console.warn("Skipping Firebase setup due to missing config.");
            return;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log("Firebase initialized");
    }
}
