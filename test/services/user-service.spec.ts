import mongoose from "mongoose";
import { UserDto } from "../../src/domain/dto/user-dto";
import { User } from "../../src/domain/entities/user";
import UserMapper from "../../src/domain/mapper/user-mapper";
import IUserRepository from "../../src/domain/repositories/user-repository";
import { DatabaseConnectionError } from "../../src/errors/database-connection-error";
import { InvalidActivationCode } from "../../src/errors/invalid-activation-code-error";
import { InvalidUserError } from "../../src/errors/invalid-user-error";
import { UserAlreadyRegisteredError } from "../../src/errors/user-already-registered-error";
import { UserNotFoundError } from "../../src/errors/user-not-found-error";
import IPasswordManager from "../../src/services/contracts/password-manager";
import UserService from "../../src/services/user-service";
import { EventEmitter } from 'events';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserMongoRepository from "../../src/infrastructure/persistence/mongo/user/user-mongo-repository";

describe('UserService Unit Tests', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockPasswordManager: jest.Mocked<IPasswordManager>;
    let eventEmitter: EventEmitter;

    const validUserData: UserDto = {
        email: 'artur.brito95@gmail.com',
        password: '123456',
        role: 'user'
    }

    beforeEach(() => {
        mockUserRepository = {
            createUser: jest.fn(),
            getUserByEmail: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getByGoogleId: jest.fn()
        }

        mockPasswordManager = {
            hashPassword: jest.fn(),
            comparePasswords: jest.fn()
        }

        eventEmitter = new EventEmitter();

        userService = new UserService(mockUserRepository, mockPasswordManager, eventEmitter);
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue(User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            }));
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            const user = await userService.createUser(validUserData);

            expect(user).toBeDefined();
            expect(user.uid).toBeDefined();
            expect(user.email).toBe(validUserData.email);
            expect(user.role).toBe(validUserData.role);
        });

        it('should throw an error if the user already exists', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            }));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(UserAlreadyRegisteredError);
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new DatabaseConnectionError());

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseConnectionError);
            }
        });

        it('should throw an error if the user creation fails', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockRejectedValue(new Error('Error creating user'));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidUserError);
            }
        });

        it('should throw an error if the email is invalid', async () => {
            const invalidUserData = {
                email: 'invalidEmail',
                password: '123456',
                role: 'user'
            }

            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.createUser(invalidUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidUserError);
                expect(error.message).toBe('Invalid user');
                expect(error.reason).toBe('Password is null or undefined');
            }
        });

        it('should emit an event when a user is created', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue(User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            }));
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            const eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');

            await userService.createUser(validUserData);

            expect(eventEmitterSpy).toHaveBeenCalledWith('CreateUserSendEmail', expect.any(Object));
        });
    });

    describe('activateUser', () => {
        it('should activate a user', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!,
                isActive: false,
                activationCode: '123456'
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            const activatedUser = await userService.activateUser(validUserData.email, '123456');

            expect(activatedUser).toBeDefined();
        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.activateUser(validUserData.email, '123456');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new DatabaseConnectionError());

            try {
                await userService.activateUser(validUserData.email, '123456');
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseConnectionError);
            }
        });

        it('should throw an error if the activation code is invalid', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!,
                isActive: false,
                activationCode: '123456'
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            try {
                await userService.activateUser(validUserData.email, '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidActivationCode);
            }
        });

    });

    describe('getUserByEmail', () => {
        it('should get a user by email', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            const foundUser = await userService.getUserByEmail(validUserData.email);

            expect(foundUser).toBeDefined();
            expect(foundUser!.email).toBe(validUserData.email);

        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.getUserByEmail(validUserData.email);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            await userService.deleteUser(UserMapper.toDto(user));

            expect(mockUserRepository.deleteUser).toHaveBeenCalled();
        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.deleteUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new DatabaseConnectionError());

            try {
                await userService.deleteUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseConnectionError);
            }


        });
    });

    describe('changePassword', () => {
        it('should change the user password', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);
            mockPasswordManager.comparePasswords.mockResolvedValue(true);
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            await userService.changePassword(validUserData.email, '123456', '654321');

            expect(mockUserRepository.updateUser).toHaveBeenCalled();
        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.changePassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new DatabaseConnectionError());

            try {
                await userService.changePassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseConnectionError);
            }
        });

        it('should throw an error if the password is incorrect', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);
            mockPasswordManager.comparePasswords.mockResolvedValue(false);

            try {
                await userService.changePassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the password is null or undefined', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);
            mockPasswordManager.comparePasswords.mockResolvedValue(true);

            try {
                await userService.changePassword(validUserData.email, '', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidUserError);
                expect(error.message).toBe('Invalid user');
                expect(error.reason).toBe('Password is null or undefined');
            }
        });
    });

    describe('resetPasswordRequest', () => {
        it('should reset the user password', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            await userService.resetPasswordRequest(validUserData.email);

            expect(mockUserRepository.updateUser).toHaveBeenCalled();
        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.resetPasswordRequest(validUserData.email);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new DatabaseConnectionError());

            try {
                await userService.resetPasswordRequest(validUserData.email);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseConnectionError);
            }
        });

        it('should emit an event when a user resets the password', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            const eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');

            await userService.resetPasswordRequest(validUserData.email);

            expect(eventEmitterSpy).toHaveBeenCalledWith('ResetPasswordRequestSendEmail', expect.any(Object));
        });

    });

    describe('resetPassword', () => {
        it('should reset the user password', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!,
                resetCode: '123456'
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            await userService.resetPassword(validUserData.email, '123456', '654321');

            expect(mockUserRepository.updateUser).toHaveBeenCalled();
        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await userService.resetPassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new DatabaseConnectionError());

            try {
                await userService.resetPassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseConnectionError);
            }
        });

        it('should throw an error if the reset code is invalid', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!,
                resetCode: '123456'
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            try {
                await userService.resetPassword(validUserData.email, '654321', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the password is null or undefined', async () => {
            const user = User.create({
                uid: '1',
                email: validUserData.email,
                password: 'hashedPassword',
                role: validUserData.role!,
                resetCode: '123456'
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            try {
                await userService.resetPassword(validUserData.email, '123456', '');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidUserError);
                expect(error.message).toBe('Invalid user');
                expect(error.reason).toBe('Password is null or undefined');
            }
        });
    });
});


describe('UserService - MongoDB Integration Tests', () => {
    let userService: UserService;
    let eventEmitter: EventEmitter;
    let mockPasswordManager: jest.Mocked<IPasswordManager>;
    let mongoServer: MongoMemoryServer;
    let userRepository: IUserRepository;

    const validUserData: UserDto = {
        email: 'artur.brito95@gmail.com',
        password: '123456',
        role: 'user'
    }

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Promise.all(
            Object.values(mongoose.connection.collections).map(
                async (collection) => await collection.deleteMany({})
            )
        );

        eventEmitter = new EventEmitter();
        mockPasswordManager = {
            hashPassword: jest.fn(),
            comparePasswords: jest.fn()
        }

        userRepository = new UserMongoRepository();

        userService = new UserService(userRepository, mockPasswordManager, eventEmitter);
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            const user = await userService.createUser(validUserData);

            expect(user).toBeDefined();
            expect(user.uid).toBeDefined();
            expect(user.email).toBe(validUserData.email);
            expect(user.role).toBe(validUserData.role);
        });

        it('should throw an error if the user already exists', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            await userService.createUser(validUserData);

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(UserAlreadyRegisteredError);
            }
        });

        it('should throw an error if the email is invalid', async () => {
            const invalidUserData = {
                email: 'invalidEmail',
                password: '123456',
                role: 'user'
            }

            try {
                await userService.createUser(invalidUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidUserError);
                expect(error.message).toBe('Invalid user');
                expect(error.reason).toBe('Password is null or undefined');
            }
        });
    });

    describe('activateUser', () => {
        it('should activate a user', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);
            let userEntity = await userRepository.getUserByEmail(validUserData.email);
            let activationCode = userEntity?.activationCode;

            const activatedUser = await userService.activateUser(validUserData.email, activationCode!);

            // fetch the user again after activation
            userEntity = await userRepository.getUserByEmail(validUserData.email);
            activationCode = userEntity?.activationCode;

            expect(activatedUser).toBeDefined();
            expect(activationCode).toBe('activated');
        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userService.activateUser(validUserData.email, '123456');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the activation code is invalid', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);

            try {
                await userService.activateUser(validUserData.email, '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidActivationCode);
            }
        });
    });

    describe('getUserByEmail', () => {
        it('should get a user by email', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);

            const foundUser = await userService.getUserByEmail(validUserData.email);

            expect(foundUser).toBeDefined();
            expect(foundUser!.email).toBe(validUserData.email);
        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userService.getUserByEmail(validUserData.email);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);


            await userService.deleteUser(user);
            try {
                const foundUser = await userService.getUserByEmail(validUserData.email);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }

        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userService.deleteUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });
    });

    describe('changePassword', () => {
        it('should change the user password', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            mockPasswordManager.comparePasswords.mockResolvedValue(true);
            const user = await userService.createUser(validUserData);

            await userService.changePassword(validUserData.email, '123456', '654321');

            const foundUser = await userService.getUserByEmail(validUserData.email);

            expect(foundUser).toBeDefined();
        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userService.changePassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the password is incorrect', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            mockPasswordManager.comparePasswords.mockResolvedValue(false);
            const user = await userService.createUser(validUserData);

            try {
                await userService.changePassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the password is null or undefined', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            mockPasswordManager.comparePasswords.mockResolvedValue(true);
            const user = await userService.createUser(validUserData);

            try {
                await userService.changePassword(validUserData.email, '', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidUserError);
                expect(error.message).toBe('Invalid user');
                expect(error.reason).toBe('Password is null or undefined');
            }
        });
    });

    describe('resetPasswordRequest', () => {
        it('should reset the user password', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);

            await userService.resetPasswordRequest(validUserData.email);

            const foundUser = await userService.getUserByEmail(validUserData.email);

            expect(foundUser).toBeDefined();
        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userService.resetPasswordRequest(validUserData.email);
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should emit an event when a user resets the password', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);

            const eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');

            await userService.resetPasswordRequest(validUserData.email);

            expect(eventEmitterSpy).toHaveBeenCalledWith('ResetPasswordRequestSendEmail', expect.any(Object));
        });
    });

    describe('resetPassword', () => {
        it('should reset the user password', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);
            await userService.resetPasswordRequest(validUserData.email);

            const userEntity = await userRepository.getUserByEmail(validUserData.email);

            await userService.resetPassword(validUserData.email, userEntity?.resetCode!, '654321');

            const foundUser = await userService.getUserByEmail(validUserData.email);

            expect(foundUser).toBeDefined();
        });

        it('should throw an error if the user does not exist', async () => {
            try {
                await userService.resetPassword(validUserData.email, '123456', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the reset code is invalid', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);

            try {
                await userService.resetPassword(validUserData.email, '654321', '654321');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
            }
        });

        it('should throw an error if the password is null or undefined', async () => {
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');
            const user = await userService.createUser(validUserData);

            try {
                await userService.resetPassword(validUserData.email, '123456', '');
            } catch (error) {
                expect(error).toBeInstanceOf(UserNotFoundError);
                expect(error.message).toBe('User not found');
            }
        });
    });
});