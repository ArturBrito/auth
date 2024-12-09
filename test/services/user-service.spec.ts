import { UserDto } from "../../src/domain/dto/user-dto";
import { User } from "../../src/domain/entities/user";
import IUserRepository from "../../src/domain/repositories/user-repository";
import IPasswordManager from "../../src/services/contracts/password-manager";
import UserService from "../../src/services/user-service";
import { EventEmitter } from 'events';

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
            deleteUser: jest.fn()
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
                role: validUserData.role
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
                role: validUserData.role
            }));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('User already registered');
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new Error('Error getting user'));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Error connecting to database');
            }
        });

        it('should throw an error if the user creation fails', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockRejectedValue(new Error('Error creating user'));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Invalid user');
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
                expect(error).toBeInstanceOf(Error);
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
                role: validUserData.role
            }));
            mockPasswordManager.hashPassword.mockResolvedValue('hashedPassword');

            const eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');

            await userService.createUser(validUserData);

            expect(eventEmitterSpy).toHaveBeenCalledWith('userCreated', expect.any(Object));
        });
    });
});