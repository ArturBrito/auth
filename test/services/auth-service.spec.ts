import { User } from "../../src/domain/entities/user";
import IUserRepository from "../../src/domain/repositories/user-repository";
import AuthService from "../../src/services/auth-service";
import IAuthService from "../../src/services/contracts/auth-service-contract";
import IEncrypter from "../../src/services/contracts/encrypter-contract";
import IPasswordManager from "../../src/services/contracts/password-manager";
import IRefreshTokensStore from "../../src/services/contracts/refresh-tokens-store";

describe('AuthService', () => {
    let authService: IAuthService;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockEncrypter: jest.Mocked<IEncrypter>;
    let mockPasswordManager: jest.Mocked<IPasswordManager>;
    let mockRefreshTokenStore: jest.Mocked<IRefreshTokensStore>;

    beforeEach(() => {
        mockUserRepository = {
            getUserByEmail: jest.fn(),
            createUser: jest.fn()
        } as any;
        mockEncrypter = {
            encrypt: jest.fn(),
            decrypt: jest.fn()
        } as any;
        mockPasswordManager = {
            comparePasswords: jest.fn(),
            hashPassword: jest.fn()
        } as any;
        mockRefreshTokenStore = {
            saveRefreshToken: jest.fn(),
            getRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn()
        } as any;

        authService = new AuthService(
            mockUserRepository,
            mockEncrypter,
            mockPasswordManager,
            mockRefreshTokenStore
        );
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

            mockUserRepository.getUserByEmail.mockResolvedValue(user);
            mockPasswordManager.comparePasswords.mockResolvedValue(true);
            mockEncrypter.encrypt.mockResolvedValue({
                token: 'token',
                refreshToken: 'refreshToken'
            });

            const auth = await authService.signIn('artur.brito95@gmail.com', 'hashedPassword');

            expect(auth).toBeDefined();
            expect(auth.token).toBe('token');
            expect(auth.refreshToken).toBe('refreshToken');

        });

        it('should throw an error if the user does not exist', async () => {
            mockUserRepository.getUserByEmail.mockResolvedValue(null);

            try {
                await authService.signIn('artur.brito95@gmail.com', 'hashedPassword');
            } catch (error) {
                expect(error.message).toBe('Invalid credentials');
            }

        });

        it('should throw an error if the user is inactive', async () => {
            const user = User.create({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                password: 'hashedPassword',
                role: 'user',
                isActive: false
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);

            try {
                await authService.signIn('artur.brito95@gmail.com', 'hashedPassword');
            } catch (error) {
                expect(error.message).toBe('Invalid credentials');
            }

        });

        it('should throw an error if the password is invalid', async () => {
            const user = User.create({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                password: 'hashedPassword',
                role: 'user',
                isActive: true
            });

            mockUserRepository.getUserByEmail.mockResolvedValue(user);
            mockPasswordManager.comparePasswords.mockResolvedValue(false);

            try {
                await authService.signIn('artur.brito95@gmail.com', 'hashedPassword');
            } catch (error) {
                expect(error.message).toBe('Invalid credentials');
            }
        });

    });

    describe('refreshToken', () => {
        it('should refresh the token', async () => {
            mockRefreshTokenStore.getRefreshToken.mockResolvedValue('refreshToken');
            mockEncrypter.decrypt.mockResolvedValue({
                uid: '1',
                email: 'artur.brito95@gmail.com',
                role: 'user',
                isActive: true
            });

            mockEncrypter.encrypt.mockResolvedValue({
                token: 'token',
                refreshToken: 'newRefreshToken'
            });

            const auth = await authService.refreshToken('refreshToken');

            expect(auth).toBeDefined();
            expect(auth.token).toBe('token');
            expect(auth.refreshToken).toBe('newRefreshToken');

        });

        it('should throw an error if the refresh token is invalid', async () => {
            mockRefreshTokenStore.getRefreshToken.mockResolvedValue(null);

            try {
                await authService.refreshToken('refreshToken');
            } catch (error) {
                expect(error.message).toBe('Invalid refresh token');
            }

        });
    });

    describe('signOut', () => {
        it('should sign out a user', async () => {
            await authService.signOut('refreshToken');

            expect(mockRefreshTokenStore.deleteRefreshToken).toHaveBeenCalledWith('refreshToken');
        });
    });
});