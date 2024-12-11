import VerifyToken from "./api/middlewares/verify-token";
import JwtAdapter from "./infrastructure/encrypt/jwt-adapter";
import UserInmemoryRepository from "./infrastructure/persistence/inmemory/user-inmemory-repository";
import SetupDbInMemory from "./infrastructure/persistence/setup/setup-inmemory";
import SetupDbMongo from "./infrastructure/persistence/setup/setup-mongo";
import InMemoryRefreshToken from "./infrastructure/refresh-tokens/inmemory-refresh-tokens";

export const DI_CONFIG = {
    "IVerifyToken": VerifyToken,
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserInmemoryRepository,
    "IRefreshTokensStore": InMemoryRefreshToken,
    "ISetupDb": SetupDbMongo
};