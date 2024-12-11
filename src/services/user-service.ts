import { UserDto } from "../domain/dto/user-dto";
import { User } from "../domain/entities/user";
import IUserRepository from "../domain/repositories/user-repository";
import IPasswordManager from "./contracts/password-manager";
import UserMapper from "../domain/mapper/user-mapper";
import IUserService from "./contracts/user-service-contract";
import { inject, injectable } from "inversify";
import { TYPES } from "../dependency-injection/types";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { UserAlreadyRegisteredError } from "../errors/user-already-registered";
import { NotFoundError } from "../errors/not-found-error";
import { EventEmitter } from "events";

@injectable()
export default class UserService implements IUserService {
    private userRepository: IUserRepository;
    private passwordManager: IPasswordManager;
    private eventEmitter: EventEmitter;
    constructor(
        @inject(TYPES.IUserRepository) userRepository: IUserRepository,
        @inject(TYPES.IPasswordManager) passwordManager: IPasswordManager,
        @inject(TYPES.EventEmmiter) eventEmitter: EventEmitter
    ) {
        this.userRepository = userRepository;
        this.passwordManager = passwordManager;
        this.eventEmitter = eventEmitter;
    }

    async createUser(userDto: UserDto): Promise<UserDto> {
        // check if the user already exists
        const userAlreadyExists = await this.userRepository.getUserByEmail(userDto.email).catch(() => {
            throw new DatabaseConnectionError();
        });

        if (userAlreadyExists) {
            throw new UserAlreadyRegisteredError();
        }

        // hash the password
        const hashedPassword = await this.passwordManager.hashPassword(userDto.password);

        // create the user
        const user = User.create({
            email: userDto.email,
            password: hashedPassword,
            role: userDto.role
        });

        // save user
        const newUser = await this.userRepository.createUser(user);

        // emit event
        this.eventEmitter.emit('CreateUserSendEmail', newUser);

        return UserMapper.toDto(newUser);

    }

    async getUserByEmail(email: string): Promise<UserDto | null> {
        const user = await this.userRepository.getUserByEmail(email);

        if (!user) {
            throw new NotFoundError();
        }

        return UserMapper.toDto(user);
    }
}