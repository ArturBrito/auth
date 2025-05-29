import { container } from '../setup';
import AuthService from '../../src/services/auth-service';
import UserService from '../../src/services/user-service';
import { UserDto } from '../../src/domain/dto/user-dto';
import { Role } from '../../src/domain/entities/user';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import IEncrypter from '../../src/services/contracts/encrypter-contract';
import IRefreshTokensStore from '../../src/services/contracts/refresh-tokens-store';
import { BadRequestError } from '../../src/errors/bad-request-error';
import { TYPES } from '../../src/dependency-injection/types';
import IUserRepository from '../../src/domain/repositories/user-repository';


describe('AuthService Integration', () => {
    let authService: AuthService;
    let userService: UserService;
    const mockEncrypter = mock<IEncrypter>();
    const mockRefreshTokenStore = mock<IRefreshTokensStore>();
    const userDto: UserDto = {
        email: 'signin@example.com',
        password: 'ValidPassword1!',
        role: Role.USER
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
            instance(mockEncrypter),
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
            when(mockEncrypter.encrypt(anything())).thenResolve(testTokens);
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
                role: Role.USER
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
            when(mockEncrypter.encrypt(anything())).thenResolve(testTokens);
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
                role: Role.USER 
            };
        
            // Mock dependencies
            when(mockRefreshTokenStore.getRefreshToken(oldRefreshToken))
                .thenResolve(oldRefreshToken); // Token exists in store
            when(mockEncrypter.decrypt(oldRefreshToken))
                .thenResolve(payload); // Decrypted payload
            when(mockEncrypter.encrypt(payload))
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
            verify(mockEncrypter.decrypt(oldRefreshToken)).once();
            verify(mockEncrypter.encrypt(payload)).once();
            verify(mockRefreshTokenStore.deleteRefreshToken(oldRefreshToken)).once();
            verify(mockRefreshTokenStore.saveRefreshToken(newTokens.refreshToken)).once();
        });
    });
});