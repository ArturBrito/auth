import { injectable } from "inversify";
import ISetupRefreshTokenStore from "../contracts/refresh-token-store.contract";
import logger from "../../../helpers/logger";

@injectable()
export default class SetupRefreshInMemory implements ISetupRefreshTokenStore {
    async setup(): Promise<void> {
        logger.info('Setting up dummy in-memory refresh token');
    }
}