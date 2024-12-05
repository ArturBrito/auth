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

const myContainer = new Container();
myContainer.bind<IUserController>(TYPES.IUserController).to(UserController);
myContainer.bind<IUserService>(TYPES.IUserService).to(UserService);
myContainer.bind<IUserRepository>(TYPES.IUserRepository).to(UserInmemoryRepository);
myContainer.bind<IPasswordManager>(TYPES.IPasswordManager).to(BcryptAdapter);
myContainer.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
myContainer.bind<IAuthController>(TYPES.IAuthController).to(AuthController);

export { myContainer };