import { injectable } from "inversify";
import ISetupDb from "./setup-db.contract";

@injectable()
export default class SetupDbInMemory implements ISetupDb {
    async setup(): Promise<void> {
        console.log('Setting up dummy in-memory database');
    }
}