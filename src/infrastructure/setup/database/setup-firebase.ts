import { injectable } from "inversify";
import ISetupDb from "../contracts/setup-db.contract";
import * as admin from "firebase-admin";
import logger from "../../../helpers/logger";

let serviceAccount: any;

try {
    serviceAccount = require("../../../../config-firebase.json");
} catch (error) {
    logger.debug("config-firebase.json not found. Firebase setup will be skipped.");
}

@injectable()
export default class SetupDbFirebase implements ISetupDb {
    async setup(): Promise<void> {
        if (!serviceAccount) {
            logger.debug("Skipping Firebase setup due to missing config.");
            return;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        logger.info("Firebase initialized");
    }
}
