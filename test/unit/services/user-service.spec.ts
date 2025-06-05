import UserService from '../../../src/services/user-service';
import { UserDto } from '../../../src/domain/dto/user-dto';
import { mock, instance, when, verify, anything, reset } from 'ts-mockito';
import IUserRepository from '../../../src/domain/repositories/user-repository';
import IPasswordManager from '../../../src/services/contracts/password-manager';
import { EventEmitter } from 'events';
import { User } from '../../../src/domain/entities/user';
import { UserAlreadyRegisteredError } from '../../../src/errors/user-already-registered-error';
import { InvalidUserError } from '../../../src/errors/invalid-user-error';
import { UserNotFoundError } from '../../../src/errors/user-not-found-error';
import { BadRequestError } from '../../../src/errors/bad-request-error';
import { Code } from '../../../src/domain/entities/code';

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: IUserRepository;
    let mockPasswordManager: IPasswordManager;
    let mockEventEmitter: EventEmitter;

    const testUserDto: UserDto = {
        email: 'test@example.com',
        password: 'ValidPassword1!',
    };

    const testUser = User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
    });

    beforeEach(() => {
        mockUserRepository = mock<IUserRepository>();
        mockPasswordManager = mock<IPasswordManager>();
        mockEventEmitter = mock<EventEmitter>();

        userService = new UserService(
            instance(mockUserRepository),
            instance(mockPasswordManager),
            instance(mockEventEmitter)
        );
    });

    afterEach(() => {
        reset(mockUserRepository);
        reset(mockPasswordManager);
        reset(mockEventEmitter);
    });

    describe('createUser', () => {
        it('should create new user when valid data provided', async () => {
            when(mockUserRepository.getUserByEmail('test@example.com')).thenResolve(null);
            when(mockPasswordManager.hashPassword('ValidPassword1!')).thenResolve('hashedpassword');
            when(mockUserRepository.createUser(anything())).thenResolve(testUser);

            const result = await userService.createUser(testUserDto);

            expect(result).toEqual({
                uid: testUser.uid,
                email: testUser.email,
            });
            verify(mockEventEmitter.emit('CreateUserSendEmail', anything())).once();
        });

        it('should throw UserAlreadyRegisteredError when email exists', async () => {
            when(mockUserRepository.getUserByEmail('existing@example.com')).thenResolve(testUser);

            await expect(userService.createUser({
                ...testUserDto,
                email: 'existing@example.com'
            })).rejects.toThrow(UserAlreadyRegisteredError);
        });

        it('should throw InvalidUserError when password is invalid', async () => {
            await expect(userService.createUser({
                ...testUserDto,
                password: 'weak'
            })).rejects.toThrow(InvalidUserError);
        });

        it('should update existing Google user with password', async () => {
            const googleUser = User.create({
                email: 'google@example.com',
                googleId: 'google-id',
            });

            when(mockUserRepository.getUserByEmail('google@example.com')).thenResolve(googleUser);
            when(mockPasswordManager.hashPassword('ValidPassword1!')).thenResolve('hashedpassword');
            when(mockUserRepository.updateUser(anything())).thenResolve();

            const result = await userService.createUser({
                ...testUserDto,
                email: 'google@example.com'
            });

            expect(result).toEqual({
                uid: googleUser.uid,
                email: googleUser.email,
            });
            verify(mockEventEmitter.emit('CreateUserSendEmail', anything())).once();
        });

        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.createUser(testUserDto))
                .rejects.toThrow('Server problem');
        });
    });

    describe('activateUser', () => {
        it('should activate user with valid activation code', async () => {
            const inactiveUser = User.create({
                email: 'inactive@example.com',
                password: 'hashedpassword',
            });

            when(mockUserRepository.getUserByEmail('inactive@example.com')).thenResolve(inactiveUser);
            when(mockUserRepository.updateUser(anything())).thenResolve();

            const result = await userService.activateUser('inactive@example.com', inactiveUser.activationCode.code);

            expect(result).toEqual({
                uid: inactiveUser.uid,
                email: inactiveUser.email,
            });
            expect(inactiveUser.isActive).toBe(true);
        });

        it('should throw UserNotFoundError when user not found', async () => {
            when(mockUserRepository.getUserByEmail('nonexistent@example.com')).thenResolve(null);

            await expect(userService.activateUser('nonexistent@example.com', 'code'))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.activateUser(testUserDto.email, 'code'))
                .rejects.toThrow('Server problem');
        });
    });

    describe('password management', () => {
        it('should reset password with valid reset code', async () => {
            // test with a new activated user
            const activatedUser = User.create({
                email: 'active@example.com',
                password: 'hashedpassword',
            });
            activatedUser.activateUser(activatedUser.activationCode.code);

            activatedUser.generateResetCode();
            const resetCode = activatedUser.resetCode.code;

            when(mockUserRepository.getUserByEmail('active@example.com')).thenResolve(activatedUser);
            when(mockPasswordManager.hashPassword('NewPassword1!')).thenResolve('newhashedpassword');
            when(mockUserRepository.updateUser(anything())).thenResolve();

            await userService.resetPassword('active@example.com', resetCode, 'NewPassword1!');

            expect(activatedUser.password).toBe('newhashedpassword');
            expect(activatedUser.resetCode).toBeNull();
            verify(mockEventEmitter.emit('PasswordChanged', anything())).once();
        });

        it('should throw UserNotFoundError when user does not exist', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(null);
            await expect(userService.resetPassword(testUserDto.email, 'resetCode', 'NewPassword1!'))
                .rejects.toThrow(UserNotFoundError);
        });


        it('should throw BadRequestError when user is inactive', async () => {
            const expiredUser = User.create({
                email: 'expired@example.com',
                password: 'hashedpassword',
            });

            when(mockUserRepository.getUserByEmail(expiredUser.email)).thenResolve(expiredUser);
            await expect(userService.resetPassword(expiredUser.email, 'resetCode', 'NewPassword1!'))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw UserNotFoundError when reset code is invalid', async () => {
            const existingUser = User.create({
                email: 'expired@example.com',
                password: 'hashedpassword',
                isActive: true
            });

            existingUser.generateResetCode();

            when(mockUserRepository.getUserByEmail(existingUser.email)).thenResolve(existingUser);
            await expect(userService.resetPassword(existingUser.email, 'invalidResetCode', 'NewPassword1!'))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw BadRequestError when reset code is expired', async () => {
            const expiredUser = User.create({
                email: 'expired@example.com',
                password: 'hashedpassword',
                isActive: true
            });
            expiredUser.generateResetCode();
            // Force expiration
            expiredUser.setResetCode(new Code(expiredUser.resetCode.code, new Date(Date.now() - 2000 * 60 * 60 * 2)));

            when(mockUserRepository.getUserByEmail('expired@example.com')).thenResolve(expiredUser);

            await expect(userService.resetPassword(
                'expired@example.com',
                expiredUser.resetCode.code,
                'NewPassword1!'
            )).rejects.toThrow(BadRequestError);
        });

        it('should throw InvalidUserError when new password does not meet requirements', async () => {
            const user = User.create({
                email: 'expired@example.com',
                password: 'hashedpassword',
                isActive: true
            });
            user.generateResetCode();
            when(mockUserRepository.getUserByEmail(user.email)).thenResolve(user);
            await expect(userService.resetPassword(user.email, user.resetCode.code, 'weak'))
                .rejects.toThrow(InvalidUserError);
        });

        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.resetPassword(testUserDto.email, 'resetCode', 'NewPassword1!'))
                .rejects.toThrow('Server problem');
        });
    });


    describe('changePassword', () => {
        it('should change password with current password', async () => {
            when(mockUserRepository.getUserByEmail('test@example.com')).thenResolve(testUser);
            when(mockPasswordManager.comparePasswords('currentPassword', 'hashedpassword')).thenResolve(true);
            when(mockPasswordManager.hashPassword('NewPassword1!')).thenResolve('newhashedpassword');
            when(mockUserRepository.updateUser(anything())).thenResolve();

            await userService.changePassword('test@example.com', 'currentPassword', 'NewPassword1!');

            expect(testUser.password).toBe('newhashedpassword');
            verify(mockEventEmitter.emit('PasswordChanged', anything())).once();
        });

        it('should throw UserNotFoundError when user does not exist', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(null);
            await expect(userService.changePassword(testUserDto.email, 'currentPassword', 'NewPassword1!'))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw UserNotFoundError when current password is incorrect', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(testUser);
            when(mockPasswordManager.comparePasswords('wrongPassword', 'hashedpassword')).thenResolve(false);

            await expect(userService.changePassword(testUserDto.email, 'wrongPassword', 'NewPassword1!'))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw InvalidUserError when new password does not meet requirements', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(testUser);
            when(mockPasswordManager.comparePasswords('currentPassword', anything())).thenResolve(true);

            await expect(userService.changePassword(testUserDto.email, 'currentPassword', 'weak'))
                .rejects.toThrow(InvalidUserError);
        });

        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.changePassword(testUserDto.email, 'currentPassword', 'NewPassword1!'))
                .rejects.toThrow('Server problem');
        });
    });

    describe('resetPasswordRequest', () => {
        it('should generate reset code for existing user', async () => {
            const existingUser = User.create({
                email: testUserDto.email,
                password: 'hashedpassword',
                isActive: true
            });

            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(existingUser);
            when(mockPasswordManager.hashPassword(anything())).thenResolve('hashedpassword');
            when(mockUserRepository.updateUser(anything())).thenResolve();

            await userService.resetPasswordRequest(testUserDto.email);

            expect(existingUser.resetCode).toBeDefined();
            verify(mockEventEmitter.emit('ResetPasswordRequestSendEmail', anything())).once();
        });

        it('should throw UserNotFoundError when user does not exist', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(null);
            await expect(userService.resetPasswordRequest(testUserDto.email))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw BadRequestError when user is inactive', async () => {
            const inactiveUser = User.create({
                email: testUserDto.email,
                password: 'hashedpassword',
            });

            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(inactiveUser);
            await expect(userService.resetPasswordRequest(testUserDto.email))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError when reset code is not expired', async () => {
            const existingUser = User.create({
                email: testUserDto.email,
                password: 'hashedpassword',
                isActive: true
            });

            existingUser.generateResetCode(); // Generate a reset code

            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(existingUser);

            await expect(userService.resetPasswordRequest(testUserDto.email))
                .rejects.toThrow(BadRequestError);
        });
        
        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.resetPasswordRequest(testUserDto.email))
                .rejects.toThrow('Server problem');
        });
    });

    describe('resendActivationCode', () => {
        it('should generate new activation code for inactive user', async () => {
            const inactiveUser = User.create({
                email: 'inactive@example.com',
                password: 'hashedpassword',
            });

            // Force expiration
            inactiveUser.setActivationCode(new Code(inactiveUser.activationCode.code, new Date(Date.now() - 1000 * 60 * 60 * 2)));

            when(mockUserRepository.getUserByEmail('inactive@example.com')).thenResolve(inactiveUser);
            when(mockUserRepository.updateUser(anything())).thenResolve();

            await userService.resendActivationCode('inactive@example.com');

            expect(inactiveUser.activationCode).toBeDefined();
            verify(mockEventEmitter.emit('CreateUserSendEmail', anything())).once();
        });

        it('should throw BadRequestError when code is not expired', async () => {
            const inactiveUser = User.create({
                email: 'inactive@example.com',
                password: 'hashedpassword',
            });

            when(mockUserRepository.getUserByEmail('inactive@example.com')).thenResolve(inactiveUser);

            await expect(userService.resendActivationCode('inactive@example.com'))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw UserAlreadyRegisteredError when user is already active', async () => {
            const activeUser = User.create({
                email: testUserDto.email,
                password: 'hashedpassword',
                isActive: true
            });

            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(activeUser);
            await expect(userService.resendActivationCode(testUserDto.email))
                .rejects.toThrow(UserAlreadyRegisteredError);
        });

        it('should throw UserNotFoundError when user does not exist', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(null);
            await expect(userService.resendActivationCode(testUserDto.email))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.resendActivationCode(testUserDto.email))
                .rejects.toThrow('Server problem');
        });
    });

    describe('deleteUser', () => {
        it('should delete user by email', async () => {
            const userToDelete = User.create({
                email: testUserDto.email,
                password: 'hashedpassword',
                isActive: true
            });

            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(userToDelete);
            when(mockUserRepository.deleteUser(userToDelete.uid)).thenResolve();
        });

        it('should throw UserNotFoundError when user does not exist', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenResolve(null);
            await expect(userService.deleteUser(testUserDto))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw DatabaseConnectionError when database connection fails', async () => {
            when(mockUserRepository.getUserByEmail(testUserDto.email)).thenReject(new Error('Database connection error'));
            await expect(userService.deleteUser(testUserDto))
                .rejects.toThrow('Server problem');
        });
    });
});