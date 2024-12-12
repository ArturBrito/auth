import { injectable } from "inversify";
import IRefreshTokensStore from "../../services/contracts/refresh-tokens-store";

@injectable()
export default class InMemoryRefreshToken implements IRefreshTokensStore {
    setup(): void {
        throw new Error("Method not implemented.");
    }
    private refreshTokens: string[] = [];

    async saveRefreshToken(refreshToken: string): Promise<void> {
        this.refreshTokens.push(refreshToken);
    }

    async getRefreshToken(refreshToken: string): Promise<string | null> {
        return this.refreshTokens.find(token => token === refreshToken) || null;
    }

    async deleteRefreshToken(refreshToken: string): Promise<void> {
        this.refreshTokens = this.refreshTokens.filter(token => token !== refreshToken);
    }
}