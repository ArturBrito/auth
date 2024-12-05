export default interface IRefreshTokensStore {
    saveRefreshToken: (refreshToken: string) => Promise<void>;
    getRefreshToken: (refreshToken: string) => Promise<string | null>;
    deleteRefreshToken: (refreshToken: string) => Promise<void>;
}