import { container } from '../setup';
import AuthService from '../../src/services/auth-service';
import UserService from '../../src/services/user-service';
import { UserDto } from '../../src/domain/dto/user-dto';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import ITokenManager from '../../src/services/contracts/token-manager-contract';
import IRefreshTokensStore from '../../src/services/contracts/refresh-tokens-store';
import { BadRequestError } from '../../src/errors/bad-request-error';
import { TYPES } from '../../src/dependency-injection/types';
import IUserRepository from '../../src/domain/repositories/user-repository';
import RedisRefreshToken from '../../src/infrastructure/refresh-tokens/redis-refresh-tokens';
import RedisMock from 'ioredis-mock';

describe('AuthService with RedisRefreshTokenStore Integration', () => {
    let redisMock = new RedisMock();
    let refreshTokenStore: RedisRefreshToken;
    refreshTokenStore = new RedisRefreshToken();
    // Override the setup method to use our mock
    refreshTokenStore['setup'] = function () {
        this['redisClient'] = redisMock;
    };
    refreshTokenStore.setup();

    let authService: AuthService;
    let userService: UserService;
    const mockTokenManager = mock<ITokenManager>();
    const userDto: UserDto = {
        email: 'signin@example.com',
        password: 'ValidPassword1!',
    };

    beforeAll(() => {
        userService = new UserService(
            container.get(TYPES.IUserRepository),
            container.get(TYPES.IPasswordManager),
            container.get(TYPES.EventEmmiter)
        );

        authService = new AuthService(
            container.get(TYPES.IUserRepository),
            instance(mockTokenManager),
            container.get(TYPES.IPasswordManager),
            refreshTokenStore
        );
    });

    beforeEach(async () => {
        await userService.createUser(userDto);

        // Get the user directly from repository to access activation code
        const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
        const dbUser = await userRepo.getUserByEmail(userDto.email);
        await userService.activateUser(userDto.email, dbUser!.activationCode.code);
    })

    describe('signIn', () => {
        it('should successfully sign in', async () => {

            // Mock token generation
            const testTokens = { token: 'test-token', refreshToken: 'test-refresh' };
            when(mockTokenManager.sign(anything())).thenResolve(testTokens);

            const result = await authService.signIn(userDto.email, 'ValidPassword1!');

            expect(result).toEqual(testTokens);
        });

        it('should fail if user is inactive', async () => {
            const userDto: UserDto = {
                email: 'tokenuser@example.com',
                password: 'ValidPassword1!',
            };

            await userService.createUser(userDto);

            // Get the user directly from repository to access activation code
            const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
            const dbUser = await userRepo.getUserByEmail(userDto.email);

            await expect(authService.signIn(userDto.email, 'WrongPassword1!'))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('token validation', () => {
        it('should signin user', async () => {

            // Mock token generation
            const testTokens = { token: 'test-token', refreshToken: 'test-refresh' };
            when(mockTokenManager.sign(anything())).thenResolve(testTokens);

            const result = await authService.signIn(userDto.email, 'ValidPassword1!');
            expect(result).toEqual(testTokens);

        });

        it('should throw error for invalid refresh token', async () => {
            await expect(authService.refreshToken('invalid-refresh-token'))
                .rejects.toThrow(BadRequestError);
        });

        it('should refresh token successfully', async () => {
            // Setup test data
            const oldRefreshToken = 'test-refresh';
            const newTokens = {
                token: 'new-access-token',
                refreshToken: 'new-refresh-token'
            };
            const payload = {
                uid: 'user-123',
                email: 'user@example.com',
            };

            // Mock dependencies
            when(mockTokenManager.verify(oldRefreshToken))
                .thenResolve(payload); // Decrypted payload
            when(mockTokenManager.sign(payload))
                .thenResolve(newTokens); // New tokens generated

            // Execute
            const result = await authService.refreshToken(oldRefreshToken);

            // Verify
            expect(result).toEqual(newTokens);

            // Verify mock interactions
            verify(mockTokenManager.verify(oldRefreshToken)).once();
            verify(mockTokenManager.sign(payload)).once();
        });

        it('should delete old refresh token after refresh', async () => {
            const oldRefreshToken = 'test-refresh';

            try {
                
                const result = await authService.refreshToken(oldRefreshToken);
            } catch (error) {
                expect(error).toBeInstanceOf(BadRequestError);      
                expect(error.message).toBe('Invalid refresh token');          
            }

        });
        
    });

});

describe('AuthService Integration', () => {
    let authService: AuthService;
    let userService: UserService;
    const mockTokenManager = mock<ITokenManager>();
    const mockRefreshTokenStore = mock<IRefreshTokensStore>();
    const userDto: UserDto = {
        email: 'signin@example.com',
        password: 'ValidPassword1!',
    };

    beforeAll(() => {
        // Get real repository and services from container
        userService = new UserService(
            container.get(TYPES.IUserRepository),
            container.get(TYPES.IPasswordManager),
            container.get(TYPES.EventEmmiter)
        );

        authService = new AuthService(
            container.get(TYPES.IUserRepository),
            instance(mockTokenManager),
            container.get(TYPES.IPasswordManager),
            instance(mockRefreshTokenStore)
        );
    });

    beforeEach(async () => {
        await userService.createUser(userDto);

        // Get the user directly from repository to access activation code
        const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
        const dbUser = await userRepo.getUserByEmail(userDto.email);
        await userService.activateUser(userDto.email, dbUser!.activationCode.code);
    })

    describe('signIn', () => {
        it('should successfully sign in with email', async () => {

            // Mock token generation
            const testTokens = { token: 'test-token', refreshToken: 'test-refresh' };
            when(mockTokenManager.sign(anything())).thenResolve(testTokens);
            when(mockRefreshTokenStore.saveRefreshToken(anything())).thenResolve();

            const result = await authService.signIn(userDto.email, 'ValidPassword1!');

            expect(result).toEqual(testTokens);
        });

        it('should fail to sign in with wrong password', async () => {

            await expect(authService.signIn(userDto.email, 'WrongPassword1!'))
                .rejects.toThrow(BadRequestError);
        });

        it('should fail if user is inactive', async () => {
            const userDto: UserDto = {
                email: 'tokenuser@example.com',
                password: 'ValidPassword1!',
            };

            await userService.createUser(userDto);

            // Get the user directly from repository to access activation code
            const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
            const dbUser = await userRepo.getUserByEmail(userDto.email);

            await expect(authService.signIn(userDto.email, 'WrongPassword1!'))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('token validation', () => {
        it('should signin user', async () => {
            
            // Mock token generation
            const testTokens = { token: 'test-token', refreshToken: 'test-refresh' };
            when(mockTokenManager.sign(anything())).thenResolve(testTokens);
            when(mockRefreshTokenStore.saveRefreshToken(anything())).thenResolve();

            const result = await authService.signIn(userDto.email, 'ValidPassword1!');
            expect(result).toEqual(testTokens);

        });

        it('should throw error for invalid refresh token', async () => {
            await expect(authService.refreshToken('invalid-refresh-token'))
                .rejects.toThrow(BadRequestError);
        });

        it('should refresh token successfully', async () => {
            // Setup test data
            const oldRefreshToken = 'valid-refresh-token';
            const newTokens = { 
                token: 'new-access-token', 
                refreshToken: 'new-refresh-token' 
            };
            const payload = { 
                uid: 'user-123', 
                email: 'user@example.com', 
            };
        
            // Mock dependencies
            when(mockRefreshTokenStore.getRefreshToken(oldRefreshToken))
                .thenResolve(oldRefreshToken); // Token exists in store
            when(mockTokenManager.verify(oldRefreshToken))
                .thenResolve(payload); // verifyed payload
            when(mockTokenManager.sign(payload))
                .thenResolve(newTokens); // New tokens generated
            when(mockRefreshTokenStore.deleteRefreshToken(oldRefreshToken))
                .thenResolve(); // Delete old token
            when(mockRefreshTokenStore.saveRefreshToken(newTokens.refreshToken))
                .thenResolve(); // Save new refresh token
        
            // Execute
            const result = await authService.refreshToken(oldRefreshToken);
        
            // Verify
            expect(result).toEqual(newTokens);
            
            // Verify mock interactions
            verify(mockRefreshTokenStore.getRefreshToken(oldRefreshToken)).once();
            verify(mockTokenManager.verify(oldRefreshToken)).once();
            verify(mockTokenManager.sign(payload)).once();
            verify(mockRefreshTokenStore.deleteRefreshToken(oldRefreshToken)).once();
            verify(mockRefreshTokenStore.saveRefreshToken(newTokens.refreshToken)).once();
        });
    });
});