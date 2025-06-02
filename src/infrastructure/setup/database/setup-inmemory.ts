import { injectable } from "inversify";
import ISetupDb from "../contracts/setup-db.contract";
import logger from "../../../helpers/logger";

@injectable()
export default class SetupDbInMemory implements ISetupDb {
    async setup(): Promise<void> {
        logger.info('Setting up dummy in-memory database');
    }
}