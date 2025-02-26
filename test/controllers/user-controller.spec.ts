import UserController from "../../src/controllers/user-controller";
import IUserRepository from "../../src/domain/repositories/user-repository";
import { BadRequestError } from "../../src/errors/bad-request-error";
import { InvalidUserError } from "../../src/errors/invalid-user-error";
import { UserAlreadyRegisteredError } from "../../src/errors/user-already-registered-error";
import { UserNotFoundError } from "../../src/errors/user-not-found-error";
import BcryptAdapter from "../../src/infrastructure/password/bcrypt-adapter";
import UserInmemoryRepository from "../../src/infrastructure/persistence/inmemory/user/user-inmemory-repository";
import IPasswordManager from "../../src/services/contracts/password-manager";
import IUserService from "../../src/services/contracts/user-service-contract";
import UserService from "../../src/services/user-service";
import { EventEmitter } from 'events';

describe('UserController Unit Tests', () => {
    let userController: UserController;
    let mockUserService: jest.Mocked<IUserService>;

    beforeEach(() => {
        mockUserService = {
            createUser: jest.fn(),
            getUserByEmail: jest.fn(),
            activateUser: jest.fn(),
            deleteUser: jest.fn(),
            changePassword: jest.fn(),
            resetPasswordRequest: jest.fn(),
            resetPassword: jest.fn(),
            resendActivationCode: jest.fn()
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

            mockUserService.getUserByEmail.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.getUserByEmail(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

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

            // Act
            await userController.createUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserAlreadyRegisteredError));

        });

        it('should throw an error if the password does not meet requirements', async () => {
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

            mockUserService.createUser.mockRejectedValue(new InvalidUserError('Password does not meet requirements'));

            // Act
            await userController.createUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(InvalidUserError));

        });
    });

    describe('activateUser', () => {
        it('should activate a user', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                    activationCode: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockUserService.activateUser.mockResolvedValue({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                role: 'user'
            });

            // Act
            await userController.activateUser(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                    activationCode: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockUserService.activateUser.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.activateUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

        it('should throw an error if the activation code is invalid', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                    activationCode: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockUserService.activateUser.mockRejectedValue(new BadRequestError('Invalid activation code'));

            // Act
            await userController.activateUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));

        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            // Arrange
            const req = {
                currentUser: {
                    uid: '1',
                    email: 'artur.brito95@gmail.com',
                    role: 'user'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.deleteUser(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                currentUser: {
                    uid: '1',
                    email: 'artur.brito95@gmail.com',
                    role: 'user'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.deleteUser.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.deleteUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

    });

    describe('changePassword', () => {
        it('should change the user password', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito95@gmail.com',
                },
                body: {
                    password: 'StrongPassword123!',
                    newPassword: 'StrongPassword321!'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito95@gmail.com',
                },
                body: {
                    password: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.changePassword.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.changePassword(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));
        });

        it('should throw an error if the password is incorrect', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito95@gmail.com',
                },
                body: {
                    password: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.changePassword.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

        it('should throw an error if the password does not meet requirements', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito95@gmail.com',
                },

                body: {
                    password: '123456',
                    newPassword: '654321'
                }

            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.changePassword.mockRejectedValue(new InvalidUserError('Password does not meet requirements'));

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(InvalidUserError));
        });

    });

    describe('resetPasswordRequest', () => {
        it('should request a password reset', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPasswordRequest(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.resetPasswordRequest.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.resetPasswordRequest(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });
    });

    describe('resetPassword', () => {
        it('should reset the user password', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    resetCode: '123456',
                    newPassword: 'StrongPassword321!'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    resetCode: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.resetPassword.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));
        });

        it('should throw an error if the reset code is invalid', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    resetCode: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.resetPassword.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

        it('should throw an error if the password does not meet requirements', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    resetCode: '123456',
                    newPassword: '654321'
                }

            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.resetPassword.mockRejectedValue(new InvalidUserError('Password does not meet requirements'));

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(InvalidUserError));
        });
    });

    describe('resendActivationCode', () => {
        it('should resend the activation code', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resendActivationCode(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.resendActivationCode.mockRejectedValue(new UserNotFoundError());

            // Act
            await userController.resendActivationCode(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));
        });

        it('should throw an error if the user is already active', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            mockUserService.resendActivationCode.mockRejectedValue(new UserAlreadyRegisteredError());

            // Act
            await userController.resendActivationCode(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserAlreadyRegisteredError));

        });
    });
});

describe('UserController Integration Tests', () => {
    let userController: UserController;
    let userService: IUserService;
    let userRepository: IUserRepository;
    let passwordManager: IPasswordManager;
    let eventEmitter: EventEmitter;

    userRepository = new UserInmemoryRepository();
    passwordManager = new BcryptAdapter();
    eventEmitter = new EventEmitter();
    userService = new UserService(userRepository, passwordManager, eventEmitter);
    userController = new UserController(userService);


    describe('createUser', () => {
        it('should create a new user', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: 'StrongPassword123!',
                    role: 'user'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();


            // Act
            const user = await userController.createUser(req as any, res as any, next);

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

            // Act
            await userController.createUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserAlreadyRegisteredError));
        });

        it('should throw an error if the password does not meet requirements', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito@gmail.com',
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
            expect(next).toHaveBeenCalledWith(expect.any(InvalidUserError));
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
                    email: 'artur.brito@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.getUserByEmail(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });
    });

    describe('resendActivationCode', () => {
        it('should resend the activation code', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resendActivationCode(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resendActivationCode(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

    });

    describe('activateUser', () => {
        it('should activate a user', async () => {
            // Arrange
            const user = await userRepository.getUserByEmail('artur.brito95@gmail.com');
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                    activationCode: user!.activationCode
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.activateUser(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito@gmail.com',
                    activationCode: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.activateUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));
        });

        it('should throw an error if the activation code is invalid', async () => {
            // Arrange
            const req = {
                params: {
                    email: 'artur.brito95@gmail.com',
                    activationCode: '123456'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.activateUser(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));

        });
    });

    describe('changePassword', () => {
        it('should change the user password', async () => {
            // Arrange
            const user = await userRepository.getUserByEmail('artur.brito95@gmail.com');

            const req = {
                currentUser: user,
                body: {
                    password: 'StrongPassword123!',
                    newPassword: 'StrongPassword321!'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito@gmail.com',
                },
                body: {
                    password: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

        it('should throw an error if the password is incorrect', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito95@gmail.com',
                },
                body: {
                    password: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

        it('should throw an error if the password does not meet requirements', async () => {
            // Arrange
            const req = {
                currentUser: {
                    email: 'artur.brito95@gmail.com',
                },
                body: {
                    password: 'StrongPassword321!',
                    newPassword: '654321'
                }

            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.changePassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(InvalidUserError));


        });

    });

    describe('resetPasswordRequest', () => {
        it('should request a password reset', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPasswordRequest(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito@gmail.com',
                }

            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPasswordRequest(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

    });

    describe('resetPassword', () => {
        it('should reset the user password', async () => {
            // Arrange
            const user = await userRepository.getUserByEmail('artur.brito95@gmail.com');

            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    resetCode: user!.resetCode,
                    newPassword: 'StrongPassword321!'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito@gmail.com',
                    resetCode: '123456',
                    newPassword: '654321'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));

        });

        it('should throw an error if the reset code is invalid', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    resetCode: '123456',
                    newPassword: '654321'
                }

            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));
        });

        it('should throw an error if the password does not meet requirements', async () => {
           // Arrange
           const user = await userRepository.getUserByEmail('artur.brito95@gmail.com');

           const req = {
               body: {
                   email: 'artur.brito95@gmail.com',
                   resetCode: user!.resetCode,
                   newPassword: '123456'
               }
           };

           const res = {
               status: jest.fn().mockReturnThis(),
               send: jest.fn()
           };

           const next = jest.fn();

           // Act
           await userController.resetPassword(req as any, res as any, next);

            // Assert
            expect(next).toHaveBeenCalledWith(expect.any(InvalidUserError));
        });
    });


    describe('deleteUser', () => {
        it('should delete a user', async () => {
            // Arrange
            const user = await userRepository.getUserByEmail('artur.brito95@gmail.com');

            const req = {
                currentUser: user
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.deleteUser(req as any, res as any, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(204);

        });

        it('should throw an error if the user does not exist', async () => {
            // Arrange
            const req = {
                currentUser: {
                    uid: '1',
                    email: 'artur.brito95@gmail.com',
                    role: 'user'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            const next = jest.fn();

            // Act
            await userController.deleteUser(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(UserNotFoundError));
        });

    });


});