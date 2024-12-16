import VerifyToken from "./api/middlewares/verify-token";
import JwtAdapter from "./infrastructure/encrypt/jwt-adapter";
import UserInmemoryRepository from "./infrastructure/persistence/inmemory/user/user-inmemory-repository";
import UserMongoRepository from "./infrastructure/persistence/mongo/user/user-mongo-repository";
import SetupDbMongo from "./infrastructure/setup/database/setup-mongo";
import SetupRedis from "./infrastructure/setup/refresh-token-store/redis";
import InMemoryRefreshToken from "./infrastructure/refresh-tokens/inmemory-refresh-tokens";
import RedisRefreshToken from "./infrastructure/refresh-tokens/redis-refresh-tokens";
import FireBaseUserRepository from "./infrastructure/persistence/firebase/user/user-firebase-repository";
import SetupDbFirebase from "./infrastructure/setup/database/setup-firebase";
import SetupDbInMemory from "./infrastructure/setup/database/setup-inmemory";
import PasswordDummyAdapter from "./infrastructure/password/dummy-adapter";
import FirebaseEncryptorAdapter from "./infrastructure/encrypt/firebase-adapter";
import UserFirebaseWithMongoRepository from "./infrastructure/persistence/firebase-with-mongo/user/user-firebase-mongo-repository";
import SetupDbFirebaseMongo from "./infrastructure/setup/database/setup-firebase-mongo";
import BcryptAdapter from "./infrastructure/password/bcrypt-adapter";

export const DI_CONFIG = {
    "IVerifyToken": VerifyToken,
    "IEncrypter": FirebaseEncryptorAdapter,
    "IUserRepository": FireBaseUserRepository,
    "ISetupDb": SetupDbFirebase,
    "IPasswordManager": PasswordDummyAdapter,
    "IRefreshTokensStore": InMemoryRefreshToken, // can be used with RedisRefreshToken
    "ISetupRefreshTokenStore": SetupDbInMemory // can be used with SetupRedis
};