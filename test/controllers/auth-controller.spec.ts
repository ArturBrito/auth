import AuthController from "../../src/controllers/auth-controller";
import { User } from "../../src/domain/entities/user";
import { BadRequestError } from "../../src/errors/bad-request-error";
import IAuthService from "../../src/services/contracts/auth-service-contract";
import IAuthIAMService from "../../src/services/contracts/iam-service-contract";

describe('AuthController Unit Tests', () => {
    let authController: AuthController;
    let mockAuthService: jest.Mocked<IAuthService>;
    let mockAuthIAMService: jest.Mocked<IAuthIAMService>;

    beforeEach(() => {
        mockAuthService = {
            signIn: jest.fn(),
            signOut: jest.fn(),
            refreshToken: jest.fn()
        } as any;

        mockAuthIAMService = {
            login: jest.fn(),
            callback: jest.fn()
        } as any;

        authController = new AuthController(mockAuthService, mockAuthIAMService);
    });

    describe('signIn', () => {
        it('should sign in a user', async () => {
            const user = User.create({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                password: 'hashedPassword',
                role: 'user',
                isActive: true
            });

            mockAuthService.signIn.mockResolvedValue({
                token: 'token',
                refreshToken: 'refreshToken'
            });

            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: 'hashedPassword'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await authController.signIn(req as any, res as any, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: 'token',
                refreshToken: 'refreshToken'
            });

        });

        it('should throw an error if the user fail to signin', async () => {
            const req = {
                body: {
                    email: 'artur.brito95@gmail.com',
                    password: 'hashedPassword'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockAuthService.signIn.mockRejectedValue(new BadRequestError('Invalid credentials'));

            await authController.signIn(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));


        });

    });

    describe('RefreshToken', () => {
        it('should refresh a token', async () => {
            const req = {
                body: {
                    refreshToken: 'refreshToken'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockAuthService.refreshToken.mockResolvedValue({
                token: 'token',
                refreshToken: 'refreshToken'
            });

            await authController.refreshToken(req as any, res as any, next);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                token: 'token',
                refreshToken: 'refreshToken'
            });

        });

        it('should throw an error if the refresh token is invalid', async () => {
            const req = {
                body: {
                    refreshToken: 'refreshToken'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const next = jest.fn();

            mockAuthService.refreshToken.mockRejectedValue(new BadRequestError('Invalid refresh token'));

            await authController.refreshToken(req as any, res as any, next);
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));

        });
    });

});