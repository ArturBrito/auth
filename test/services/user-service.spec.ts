import { UserDto } from "../../src/domain/dto/user-dto";
import { User } from "../../src/domain/entities/user";
import IUserRepository from "../../src/domain/repositories/user-repository";
import UserService from "../../src/services/user-service";


describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<IUserRepository>;

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

        userService = new UserService(mockUserRepository, {
            hashPassword: jest.fn(),
            comparePasswords: jest.fn()
        });
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

            const user = await userService.createUser(validUserData);

            expect(user).toBeDefined();
            expect(user.uid).toBeDefined();
            expect(user.email).toBe(validUserData.email);
            expect(user.role).toBe(validUserData.role);
            expect(user.password).toBe('hashedPassword');
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
                expect(error.message).toBe('User already exists');
            }
        });

        it('should throw an error if the database throw error', async () => {
            mockUserRepository.getUserByEmail.mockRejectedValue(new Error('Error getting user'));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Error createing user');
            }
        });

        it('should throw an error if the user creation fails', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockRejectedValue(new Error('Error creating user'));

            try {
                await userService.createUser(validUserData);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Error creating user');
            }
        });
    });
});