import VerifyToken from "./api/middlewares/verify-token";
import JwtAdapter from "./infrastructure/encrypt/jwt-adapter";
import UserInmemoryRepository from "./infrastructure/persistence/inmemory/user-inmemory-repository";
import InMemoryRefreshToken from "./infrastructure/refresh-tokens/inmemory-refresh-tokens";

export const DI_CONFIG = {
    "IVerifyToken": VerifyToken,
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserInmemoryRepository,
    "IRefreshTokensStore": InMemoryRefreshToken
};