import UserController from "../../src/controllers/user-controller";
import IUserRepository from "../../src/domain/repositories/user-repository";
import { UserAlreadyRegisteredError } from "../../src/errors/user-already-registered";
import BcryptAdapter from "../../src/infrastructure/password/bcrypt-adapter";
import UserInmemoryRepository from "../../src/infrastructure/persistence/inmemory/user-inmemory-repository";
import IPasswordManager from "../../src/services/contracts/password-manager";
import IUserService from "../../src/services/contracts/user-service-contract";
import UserService from "../../src/services/user-service";

describe('UserController Unit Tests', () => {
    let userController: UserController;
    let mockUserService: jest.Mocked<IUserService>;

    beforeEach(() => {
        mockUserService = {
            createUser: jest.fn(),
            getUserByEmail: jest.fn()
        };

        userController = new UserController(mockUserService);
    });

    describe('getUserByEmail', () => {
        it('should get a user by email', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            mockUserService.getUserByEmail.mockResolvedValue({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                role: 'user'
            });

            // Act
            await userController.getUserByEmail(req as any, res as any, next);
            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                role: 'user'
            });
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockUserService.getUserByEmail.mockResolvedValue(null);

            try {
                // Act
                await userController.getUserByEmail(req as any, res as any, next);
            } catch (error) {
                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
            }

        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: '123456',
                    role: 'user'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockUserService.createUser.mockResolvedValue({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                role: 'user'
            });

            // Act
            await userController.createUser(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                role: 'user'
            });

        });

        it('should throw an error if the user already exists', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: '123456',
                    role: 'user'
                }
            }

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            const next = jest.fn();

            mockUserService.createUser.mockRejectedValue(new UserAlreadyRegisteredError());

            try {
                // Act
                await userController.createUser(req as any, res as any, next);
            } catch (error) {
                // Assert
                expect(error.statusCode).toEqual(403);
                expect(error.reason).toEqual('User already registered');
            }


        });
    });
});

describe('UserController Integration Tests', () => {
    let userController: UserController;
    let userService: IUserService;
    let userRepository: IUserRepository;
    let passwordManager: IPasswordManager;

    userRepository = new UserInmemoryRepository();
    passwordManager = new BcryptAdapter();
    userService = new UserService(userRepository, passwordManager);
    userController = new UserController(userService);


    describe('createUser', () => {
        it('should create a new user', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: '123456',
                    role: 'user'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();


            // Act
            await userController.createUser(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(201);

        });

        it('should throw an error if the user already exists', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: '123456',
                    role: 'user'
                }
            }

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            const next = jest.fn();

            try {
                // Act
                await userController.createUser(req as any, res as any, next);
            } catch (error) {
                // Assert
                expect(error.statusCode).toEqual(403);
                expect(error.reason).toEqual('User already registered');
            }


        });
    });


    describe('getUserByEmail', () => {
        it('should get a user by email', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            // Act
            await userController.getUserByEmail(req as any, res as any, next);
            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();


            try {
                // Act
                await userController.getUserByEmail(req as any, res as any, next);
            } catch (error) {
                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
            }

        });
    });

});