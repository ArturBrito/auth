import { injectable } from "inversify";
import ISetupDb from "./setup-db.contract";
import mongoose from "mongoose";

@injectable()
export default class SetupDbMongo implements ISetupDb {
    async setup(): Promise<void> {
        console.log('Setting up mongo database');
        try {
            const uri = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/';
            await mongoose.connect(uri);
            console.log('Mongo database connected');
        } catch (error) {
            console.error('Error setting up mongo database');
            throw new Error('Error setting up mongo database');
        }

    }
}