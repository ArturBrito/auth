import VerifyToken from "./api/middlewares/verify-token";
import JwtAdapter from "./infrastructure/encrypt/jwt-adapter";
import UserInmemoryRepository from "./infrastructure/persistence/inmemory/user-inmemory-repository";
import UserMongoRepository from "./infrastructure/persistence/mongo/user/user-mongo-repository";
import SetupDbMongo from "./infrastructure/setup/database/setup-mongo";
import SetupRedis from "./infrastructure/setup/refresh-token-store/redis";
import InMemoryRefreshToken from "./infrastructure/refresh-tokens/inmemory-refresh-tokens";
import RedisRefreshToken from "./infrastructure/refresh-tokens/redis-refresh-tokens";

export const DI_CONFIG = {
    "IVerifyToken": VerifyToken,
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserMongoRepository, // together with SetupDbMongo in ISetupDb
    "ISetupDb": SetupDbMongo,
    "IRefreshTokensStore": RedisRefreshToken, // together with SetupRedis in ISetupRefreshTokenStore
    "ISetupRefreshTokenStore": SetupRedis
};