import { UserDto } from "../domain/dto/user-dto";
import { User } from "../domain/entities/user";
import IUserRepository from "../domain/repositories/user-repository";
import IPasswordManager from "./contracts/password-manager";
import UserMapper from "../domain/mapper/user-mapper";
import IUserService from "./contracts/user-service-contract";
import { inject, injectable } from "inversify";
import { TYPES } from "../dependency-injection/types";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { UserAlreadyRegisteredError } from "../errors/user-already-registered-error";
import { EventEmitter } from "events";
import { UserNotFoundError } from "../errors/user-not-found-error";
import { passwordRequirements } from "../config";
import { InvalidUserError } from "../errors/invalid-user-error";
import { BadRequestError } from "../errors/bad-request-error";

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
    async resendActivationCode(email: string): Promise<void> {
        // get user by email
        const user = await this.userRepository.getUserByEmail(email).catch(() => {
            throw new DatabaseConnectionError();
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        if (user.isActive) {
            throw new UserAlreadyRegisteredError();
        }

        if (user.activationCode && !user.activationCode.isExpired()) {
            throw new BadRequestError('You\'ve already requested an activation code. Please wait for the code to expire before requesting a new one.');
        }

        user.generateActivationCode();

        // save user
        await this.userRepository.updateUser(user);

        this.eventEmitter.emit('CreateUserSendEmail', UserMapper.toUserCodesDto(user));
    }
    async resetPasswordRequest(email: string): Promise<void> {
        // get user by email
        const user = await this.userRepository.getUserByEmail(email).catch(() => {
            throw new DatabaseConnectionError();
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        if (user.isActive === false) {
            throw new BadRequestError('User is inactive');
        }

        if (user.resetCode && !user.resetCode.isExpired()) {
            throw new BadRequestError('You\'ve already requested a reset code. Please wait for the code to expire before requesting a new one.');
        }

        // generate reset code
        user.generateResetCode();

        // save user
        await this.userRepository.updateUser(user);

        this.eventEmitter.emit('ResetPasswordRequestSendEmail', UserMapper.toUserCodesDto(user));
    }
    async resetPassword(email: string, resetCode: string, newPassword: string): Promise<void> {
        // get user by email
        const user = await this.userRepository.getUserByEmail(email).catch(() => {
            throw new DatabaseConnectionError();
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        if (user.isActive === false) {
            throw new BadRequestError('User is inactive');
        }

        if (user.resetCode && user.resetCode.isExpired()) {
            throw new BadRequestError('Reset code has expired. Please request a new reset code.');
        }

        // check if the reset code is correct
        const isResetCodeCorrect = user.validateResetCode(resetCode);

        if (!isResetCodeCorrect) {
            throw new UserNotFoundError();
        }

        // hash the new password
        const hashedPassword = await this.passwordManager.hashPassword(newPassword);

        // validate password
        const isPasswordValid = User.isValidPassword(newPassword, passwordRequirements);

        if (!isPasswordValid) {
            throw new InvalidUserError('Password does not meet requirements');
        }

        // set the new password
        user.setPassword(hashedPassword);

        // clear reset code
        user.clearResetCode();

        // save user
        await this.userRepository.updateUser(user);

        this.eventEmitter.emit('PasswordChanged', UserMapper.toDto(user));
    }
    async changePassword(email: string, password: string, newPassword: string): Promise<void> {
        // get user by email
        const user = await this.userRepository.getUserByEmail(email).catch(() => {
            throw new DatabaseConnectionError();
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // check if the password is correct
        const isPasswordCorrect = await this.passwordManager.comparePasswords(password, user.password);

        if (!isPasswordCorrect) {
            throw new UserNotFoundError();
        }

        // hash the new password
        const hashedPassword = await this.passwordManager.hashPassword(newPassword);

        // validate password
        const isPasswordValid = User.isValidPassword(newPassword, passwordRequirements);

        if (!isPasswordValid) {
            throw new InvalidUserError('Password does not meet requirements');
        }

        // set the new password
        user.setPassword(hashedPassword);

        // save user
        await this.userRepository.updateUser(user);

        this.eventEmitter.emit('PasswordChanged', UserMapper.toDto(user));
    }
    async deleteUser(user: UserDto): Promise<void> {
        // get user by email
        const userToDelete = await this.userRepository.getUserByEmail(user.email).catch(() => {
            throw new DatabaseConnectionError();
        });
        if (!userToDelete) {
            throw new UserNotFoundError();
        }

        // delete user
        await this.userRepository.deleteUser(userToDelete.uid);
    }
    async activateUser(email: string, activationCode: string): Promise<UserDto> {
        // get user by email
        const user = await this.userRepository.getUserByEmail(email).catch(() => {
            throw new DatabaseConnectionError();
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        // activate user
        user.activateUser(activationCode);

        // clear activation code
        user.clearActivationCode();

        // save user
        await this.userRepository.updateUser(user);

        return UserMapper.toDto(user);
    }

    async createUser(userDto: UserDto): Promise<UserDto> {
        // check if the user already exists
        let userAlreadyExists: User;
        try {
            userAlreadyExists = await this.userRepository.getUserByEmail(userDto.email)
        } catch (error) {
            throw new DatabaseConnectionError();
        }

        if (userAlreadyExists && !userAlreadyExists.googleId) {
            throw new UserAlreadyRegisteredError();
        }

        // hash the password
        const hashedPassword = await this.passwordManager.hashPassword(userDto.password);

        // validate password
        const isPasswordValid = User.isValidPassword(userDto.password, passwordRequirements);

        if (!isPasswordValid) {
            throw new InvalidUserError('Password does not meet requirements');
        }

        if (userAlreadyExists && userAlreadyExists.googleId) {
            // associate password with the user
            userAlreadyExists.setPassword(hashedPassword);
            await this.userRepository.updateUser(userAlreadyExists);
            // emit event
            this.eventEmitter.emit('CreateUserSendEmail', UserMapper.toUserCodesDto(userAlreadyExists));
            return UserMapper.toDto(userAlreadyExists);
        }

        // create the user
        const user = User.create({
            email: userDto.email,
            password: hashedPassword,
            role: userDto.role
        });

        // save user
        const newUser = await this.userRepository.createUser(user);

        // emit event
        this.eventEmitter.emit('CreateUserSendEmail', UserMapper.toUserCodesDto(newUser));

        return UserMapper.toDto(newUser);

    }
}