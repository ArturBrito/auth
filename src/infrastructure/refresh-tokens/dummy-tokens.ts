import { injectable } from "inversify";
import IRefreshTokensStore from "../../services/contracts/refresh-tokens-store";

@injectable()
export default class DummyRefreshToken implements IRefreshTokensStore {
    setup(): void {
        throw new Error("Method not implemented.");
    }
    saveRefreshToken(refreshToken: string): Promise<void> {
        return;
    }
    getRefreshToken(refreshToken: string): Promise<string | null> {
        return null;
    }
    deleteRefreshToken(refreshToken: string): Promise<void> {
        return;
    }

}