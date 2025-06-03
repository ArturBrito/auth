import JwtAdapter from "./infrastructure/token-manager/jwt-adapter";
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
import FirebaseTokenManagerAdapter from "./infrastructure/token-manager/firebase-adapter";
import BcryptAdapter from "./infrastructure/password/bcrypt-adapter";
import DummyRefreshToken from "./infrastructure/refresh-tokens/dummy-tokens";
import DummyEmailClient from "./infrastructure/email/dummy-email-client";
import NodeMailerClient from "./infrastructure/email/node-mailer-client";

const inMemory = {
    "ITokenManager": JwtAdapter,
    "IUserRepository": UserInmemoryRepository,
    "ISetupDb": SetupDbInMemory,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": InMemoryRefreshToken,
    "ISetupRefreshTokenStore": SetupDbInMemory,
    "IEmailClient": DummyEmailClient
}

const inMemoryWithRedis = {
    "ITokenManager": JwtAdapter,
    "IUserRepository": UserInmemoryRepository,
    "ISetupDb": SetupDbInMemory,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": RedisRefreshToken,
    "ISetupRefreshTokenStore": SetupRedis,
    "IEmailClient": DummyEmailClient
}

const mongoWithRedis = {
    "ITokenManager": JwtAdapter,
    "IUserRepository": UserMongoRepository,
    "ISetupDb": SetupDbMongo,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": RedisRefreshToken, // can be used with InMemoryRefreshToken
    "ISetupRefreshTokenStore": SetupRedis, // can be used with SetupDbInMemory
    "IEmailClient": process.env.NODE_ENV != 'production' ? DummyEmailClient : NodeMailerClient
}

const mongoWithoutRedis = {
    "ITokenManager": JwtAdapter,
    "IUserRepository": UserMongoRepository,
    "ISetupDb": SetupDbMongo,
    "IPasswordManager": BcryptAdapter,
    "IRefreshTokensStore": DummyRefreshToken, // can be used with RedisRefreshToken
    "ISetupRefreshTokenStore": SetupDbInMemory, // can be used with SetupRedis
    "IEmailClient": process.env.NODE_ENV != 'production' ? DummyEmailClient : NodeMailerClient
}

const firebase = {
    "ITokenManager": FirebaseTokenManagerAdapter,
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
    mongoWithoutRedis,
    firebase,
    inMemoryWithRedis
}

export default config[selectedConfig];

export const passwordRequirements = process.env.PASSWORD_REQUIREMENTS || "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$";