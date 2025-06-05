import AuthService from '../../../src/services/auth-service';
import { AuthDto } from '../../../src/domain/dto/auth-dto';
import { BadRequestError } from '../../../src/errors/bad-request-error';
import { mock, instance, when, verify, anything, reset } from 'ts-mockito';
import IUserRepository from '../../../src/domain/repositories/user-repository';
import ITokenManager from '../../../src/services/contracts/token-manager-contract';
import IPasswordManager from '../../../src/services/contracts/password-manager';
import IRefreshTokensStore from '../../../src/services/contracts/refresh-tokens-store';
import { User } from '../../../src/domain/entities/user';

describe('AuthService', () => {
    let authService: AuthService;
    let mockUserRepository: IUserRepository;
    let mockTokenManager: ITokenManager;
    let mockPasswordManager: IPasswordManager;
    let mockRefreshTokenStore: IRefreshTokensStore;

    const testUser = User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
    });

    beforeEach(() => {
        mockUserRepository = mock<IUserRepository>();
        mockTokenManager = mock<ITokenManager>();
        mockPasswordManager = mock<IPasswordManager>();
        mockRefreshTokenStore = mock<IRefreshTokensStore>();

        authService = new AuthService(
            instance(mockUserRepository),
            instance(mockTokenManager),
            instance(mockPasswordManager),
            instance(mockRefreshTokenStore)
        );

        testUser.activateUser(testUser.activationCode.code); // Activate user for tests
    });

    afterEach(() => {
        reset(mockUserRepository);
        reset(mockTokenManager);
        reset(mockPasswordManager);
        reset(mockRefreshTokenStore);
    });

    describe('signIn', () => {
        it('should return tokens when credentials are valid', async () => {
            const testTokens: AuthDto = {
                token: 'test-token',
                refreshToken: 'test-refresh-token'
            };

            when(mockUserRepository.getUserByEmail('test@example.com')).thenResolve(testUser);
            when(mockPasswordManager.comparePasswords('password', 'hashedpassword')).thenResolve(true);
            when(mockTokenManager.sign(anything())).thenResolve(testTokens);

            const result = await authService.signIn('test@example.com', 'password');

            expect(result).toEqual(testTokens);
            verify(mockRefreshTokenStore.saveRefreshToken('test-refresh-token')).once();
        });


        it('should throw BadRequestError when user is not found', async () => {
            when(mockUserRepository.getUserByEmail('test@example.com')).thenResolve(null);

            await expect(authService.signIn('password', 'test@example.com')).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError when user is inactive', async () => {
            const inactiveUser = User.create({
                email: 'inactive@example.com',
                password: 'hashedpassword',
            });

            when(mockUserRepository.getUserByEmail('inactive@example.com')).thenResolve(inactiveUser);

            await expect(authService.signIn('password', 'inactive@example.com')).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError when password is invalid', async () => {
            when(mockUserRepository.getUserByEmail('test@example.com')).thenResolve(testUser);
            when(mockPasswordManager.comparePasswords('wrongpassword', 'hashedpassword')).thenResolve(false);

            await expect(authService.signIn('wrongpassword', 'test@example.com')).rejects.toThrow(BadRequestError);
        });
    });

    describe('refreshToken', () => {
        it('should return new tokens when refresh token is valid', async () => {
            const oldTokens: AuthDto = {
                token: 'old-token',
                refreshToken: 'old-refresh-token'
            };
            const newTokens: AuthDto = {
                token: 'new-token',
                refreshToken: 'new-refresh-token'
            };
            const payload = { uid: '123', email: 'test@example.com' };

            when(mockRefreshTokenStore.getRefreshToken('old-refresh-token')).thenResolve('stored-token');
            when(mockTokenManager.verify('old-refresh-token')).thenResolve(payload);
            when(mockTokenManager.sign(payload)).thenResolve(newTokens);

            const result = await authService.refreshToken('old-refresh-token');

            expect(result).toEqual(newTokens);
            verify(mockRefreshTokenStore.deleteRefreshToken('old-refresh-token')).once();
            verify(mockRefreshTokenStore.saveRefreshToken('new-refresh-token')).once();
        });

        it('should throw BadRequestError when refresh token is invalid', async () => {
            when(mockRefreshTokenStore.getRefreshToken('invalid-token')).thenResolve(null);

            await expect(authService.refreshToken('invalid-token')).rejects.toThrow(BadRequestError);
        });
    });

    describe('validateToken', () => {
        it('should return user when token is valid', async () => {
            const payload = { uid: '123', email: 'test@example.com' };

            when(mockTokenManager.verify('valid-token')).thenResolve(payload);
            when(mockUserRepository.getUserById('123')).thenResolve(testUser);

            const result = await authService.validateToken('valid-token');

            expect(result).toEqual({
                uid: testUser.uid,
                email: testUser.email,
            });
        });

        it('should throw BadRequestError when token is invalid', async () => {
            when(mockTokenManager.verify('invalid-token')).thenResolve(null);

            await expect(authService.validateToken('invalid-token')).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError when user is not found', async () => {
            const payload = { uid: '123', email: 'test@example.com' };

            when(mockTokenManager.verify('valid-token')).thenResolve(payload);
            when(mockUserRepository.getUserById('123')).thenResolve(null);

            await expect(authService.validateToken('valid-token')).rejects.toThrow(BadRequestError);
        });
    });

    describe('signOut', () => {
        it('should delete refresh token', async () => {
            await authService.signOut('refresh-token');
            verify(mockRefreshTokenStore.deleteRefreshToken('refresh-token')).once();
        });
    });
});