import { injectable } from "inversify";
import ISetupRefreshTokenStore from "../contracts/refresh-token-store.contract";


@injectable()
export default class SetupRefreshInMemory implements ISetupRefreshTokenStore {
    async setup(): Promise<void> {
        console.log('Setting up dummy in-memory refresh token');
    }
}