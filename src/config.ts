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
import BcryptAdapter from "./infrastructure/password/bcrypt-adapter";
import DummyRefreshToken from "./infrastructure/refresh-tokens/dummy-tokens";
import DummyEmailClient from "./infrastructure/email/dummy-email-client";
import NodeMailerClient from "./infrastructure/email/node-mailer-client";

/*export const DI_CONFIG = {
    "IVerifyToken": VerifyToken,
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserMongoRepository,
    "ISetupDb": SetupDbMongo,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": RedisRefreshToken, // can be used with InMemoryRefreshToken
    "ISetupRefreshTokenStore": SetupRedis // can be used with SetupDbInMemory
};*/

const inMemory = {
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserInmemoryRepository,
    "ISetupDb": SetupDbInMemory,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": InMemoryRefreshToken,
    "ISetupRefreshTokenStore": SetupDbInMemory,
    "IEmailClient": DummyEmailClient
}

const mongoWithRedis = {
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserMongoRepository,
    "ISetupDb": SetupDbMongo,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": RedisRefreshToken, // can be used with InMemoryRefreshToken
    "ISetupRefreshTokenStore": SetupRedis, // can be used with SetupDbInMemory
    "IEmailClient": process.env.NODE_ENV != 'production' ? DummyEmailClient : NodeMailerClient
}

const mongoWithInMemory = {
    "IEncrypter": JwtAdapter,
    "IUserRepository": UserMongoRepository,
    "ISetupDb": SetupDbMongo,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": InMemoryRefreshToken, // can be used with RedisRefreshToken
    "ISetupRefreshTokenStore": SetupDbInMemory, // can be used with SetupRedis
    "IEmailClient": process.env.NODE_ENV != 'production' ? DummyEmailClient : NodeMailerClient
}

const firebase = {
    "IEncrypter": FirebaseEncryptorAdapter,
    "IUserRepository": FireBaseUserRepository,
    "ISetupDb": SetupDbFirebase,
    "IPasswordManager": PasswordDummyAdapter,
    "IRefreshTokensStore": DummyRefreshToken,
    "ISetupRefreshTokenStore": SetupDbInMemory,
    "IEmailClient": process.env.NODE_ENV != 'production' ? DummyEmailClient : NodeMailerClient
}

const selectedConfig = process.env.SELECTED_SETUP || 'inMemory';

const config = {
    inMemory,
    mongoWithRedis,
    mongoWithInMemory,
    firebase
}

export default config[selectedConfig];