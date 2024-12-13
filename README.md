# generate RS256 keys:
ssh-keygen -t rsa -b 4096 -m PEM -f rs256.rsa
# Don't add passphrase
openssl rsa -in rs256.rsa -pubout -outform PEM -out rs256.rsa.pub

# Run docker-compose files
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.prod.yml up --build

# Redis
redis-cli -h 127.0.0.1 -p 6379 -password eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81
KEYS *

## Config
# Local in memory
"IVerifyToken": VerifyToken,
"IEncrypter": JwtAdapter,
"IUserRepository": UserInmemoryRepository,
"ISetupDb": SetupDbInMemory,
"IPasswordManager": BcryptAdapter,
"IRefreshTokensStore": InMemoryRefreshToken,
"ISetupRefreshTokenStore": SetupDbInMemory


# Local with mongo
"IVerifyToken": VerifyToken,
"IEncrypter": JwtAdapter,
"IUserRepository": UserMongoRepository,
"ISetupDb": SetupDbMongo,
"IRefreshTokensStore": RedisRefreshToken, // can be used with InMemoryRefreshToken
"ISetupRefreshTokenStore": SetupRedis // can be used with SetupDbInMemory


# Firebase
"IVerifyToken": VerifyToken,
"IEncrypter": FirebaseEncryptorAdapter,
"IUserRepository": FireBaseUserRepository,
"ISetupDb": SetupDbFirebase,
"IPasswordManager": PasswordDummyAdapter,
"IRefreshTokensStore": InMemoryRefreshToken, // can be used with RedisRefreshToken
"ISetupRefreshTokenStore": SetupDbInMemory // can be used with SetupRedis