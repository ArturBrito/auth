import { inject, injectable } from "inversify";
import IRefreshTokensStore from "../../../services/contracts/refresh-tokens-store";
import ISetupRefreshTokenStore from "../contracts/refresh-token-store.contract";
import { TYPES } from "../../../dependency-injection/types";

@injectable()
export default class SetupRedis implements ISetupRefreshTokenStore {
    private refreshTokenStore: IRefreshTokensStore;

    constructor(
        @inject(TYPES.IRefreshTokensStore) refreshTokenStore: IRefreshTokensStore
    ){
        this.refreshTokenStore = refreshTokenStore;
    }

    async setup(): Promise<void> {
        this.refreshTokenStore.setup();
        console.log('Setting up redis refresh token store');
    }
}