import { Container } from "inversify";
import IUserController from "../controllers/contracts/user-controller-contract";
import { TYPES } from "./types";
import UserController from "../controllers/user-controller";
import IUserService from "../services/contracts/user-service-contract";
import UserService from "../services/user-service";
import IUserRepository from "../domain/repositories/user-repository";
import UserInmemoryRepository from "../infrastructure/persistence/inmemory/user-inmemory-repository";
import IPasswordManager from "../services/contracts/password-manager";
import BcryptAdapter from "../infrastructure/password/bcrypt-adapter";
import IAuthService from "../services/contracts/auth-service-contract";
import AuthService from "../services/auth-service";
import AuthController from "../controllers/auth-controller";
import IAuthController from "../controllers/contracts/auth-controller-contract";
import IEncrypter from "../services/contracts/encrypter-contract";
import JwtAdapter from "../infrastructure/encrypt/jwt-adapter";
import IRefreshTokensStore from "../services/contracts/refresh-tokens-store";
import InMemoryRefreshToken from "../infrastructure/refresh-tokens/inmemory-refresh-tokens";
import { EventEmitter } from "events";
import { EventHandlers } from "../events/event-handlers";
import { CreateUserSendEmailHandler } from "../events/create-user-send-email.event";
import IEmailClient from "../services/contracts/email-client";
import DummyEmailClient from "../infrastructure/email/dummy-email-client";
import IVerifyToken from "../api/middlewares/contracts/verify-token.contract";
import VerifyToken from "../api/middlewares/verify-token";

const myContainer = new Container();
myContainer.bind<IUserController>(TYPES.IUserController).to(UserController);
myContainer.bind<IUserService>(TYPES.IUserService).to(UserService);
myContainer.bind<IUserRepository>(TYPES.IUserRepository).to(UserInmemoryRepository).inSingletonScope();
myContainer.bind<IPasswordManager>(TYPES.IPasswordManager).to(BcryptAdapter);
myContainer.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
myContainer.bind<IAuthController>(TYPES.IAuthController).to(AuthController);
myContainer.bind<IEncrypter>(TYPES.IEncrypter).to(JwtAdapter);
myContainer.bind<IRefreshTokensStore>(TYPES.IRefreshTokensStore).to(InMemoryRefreshToken).inSingletonScope();
myContainer.bind(TYPES.EventEmmiter).toConstantValue(new EventEmitter());
myContainer.bind<EventHandlers>(EventHandlers).toSelf();
myContainer.bind<CreateUserSendEmailHandler>(TYPES.CreateUserSendEmailHandler).to(CreateUserSendEmailHandler);
myContainer.bind<IEmailClient>(TYPES.IEmailClient).to(DummyEmailClient);
myContainer.bind<IVerifyToken>(TYPES.IVerifyToken).to(VerifyToken);

export { myContainer };