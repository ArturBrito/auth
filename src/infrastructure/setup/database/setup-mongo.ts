import { injectable } from "inversify";
import mongoose from "mongoose";
import ISetupDb from "../contracts/setup-db.contract";
import logger from "../../../helpers/logger";

@injectable()
export default class SetupDbMongo implements ISetupDb {
    async setup(): Promise<void> {
        logger.info('Setting up mongo database');
        try {
            const uri = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/';
            await mongoose.connect(uri);
            logger.info('Mongo database connected');
        } catch (error) {
            logger.error('Error setting up mongo database: ', error);
            throw new Error('Error setting up mongo database');
        }

    }
}