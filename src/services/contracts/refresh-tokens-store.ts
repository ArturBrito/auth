export default interface IRefreshTokensStore {
    setup(): void;
    saveRefreshToken(refreshToken: string): Promise<void>;
    getRefreshToken(refreshToken: string): Promise<string | null>;
    deleteRefreshToken(refreshToken: string): Promise<void>;
}