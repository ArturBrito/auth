import UserService from '../../../src/services/user-service';
import { UserDto } from '../../../src/domain/dto/user-dto';
import { mock, instance, when, verify, anything, reset } from 'ts-mockito';
import IUserRepository from '../../../src/domain/repositories/user-repository';
import IPasswordManager from '../../../src/services/contracts/password-manager';
import { EventEmitter } from 'events';
import { User } from '../../../src/domain/entities/user';
import { Role } from '../../../src/domain/entities/user';
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
        role: Role.USER
    };

    const testUser = User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        role: Role.USER
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
                role: testUser.role
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
                role: Role.USER
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
                role: googleUser.role
            });
            verify(mockEventEmitter.emit('CreateUserSendEmail', anything())).once();
        });
    });

    describe('activateUser', () => {
        it('should activate user with valid activation code', async () => {
            const inactiveUser = User.create({
                email: 'inactive@example.com',
                password: 'hashedpassword',
                role: Role.USER
            });

            when(mockUserRepository.getUserByEmail('inactive@example.com')).thenResolve(inactiveUser);
            when(mockUserRepository.updateUser(anything())).thenResolve();

            const result = await userService.activateUser('inactive@example.com', inactiveUser.activationCode.code);

            expect(result).toEqual({
                uid: inactiveUser.uid,
                email: inactiveUser.email,
                role: inactiveUser.role
            });
            expect(inactiveUser.isActive).toBe(true);
        });

        it('should throw UserNotFoundError when user not found', async () => {
            when(mockUserRepository.getUserByEmail('nonexistent@example.com')).thenResolve(null);

            await expect(userService.activateUser('nonexistent@example.com', 'code'))
                .rejects.toThrow(UserNotFoundError);
        });
    });

    describe('password management', () => {
        it('should reset password with valid reset code', async () => {
            // test with a new activated user
            const activatedUser = User.create({
                email: 'active@example.com',
                password: 'hashedpassword',
                role: Role.USER
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

        it('should change password with current password', async () => {
          when(mockUserRepository.getUserByEmail('test@example.com')).thenResolve(testUser);
          when(mockPasswordManager.comparePasswords('currentPassword', 'hashedpassword')).thenResolve(true);
          when(mockPasswordManager.hashPassword('NewPassword1!')).thenResolve('newhashedpassword');
          when(mockUserRepository.updateUser(anything())).thenResolve();
    
          await userService.changePassword('test@example.com', 'currentPassword', 'NewPassword1!');
          
          expect(testUser.password).toBe('newhashedpassword');
          verify(mockEventEmitter.emit('PasswordChanged', anything())).once();
        });
    
        it('should throw BadRequestError when reset code is expired', async () => {
          const expiredUser = User.create({
            email: 'expired@example.com',
            password: 'hashedpassword',
            role: Role.USER
          });
          expiredUser.generateResetCode();
          // Force expiration
          expiredUser.setResetCode(new Code(expiredUser.resetCode.code, new Date(Date.now() - 1000 * 60 * 60 * 2)));
    
          when(mockUserRepository.getUserByEmail('expired@example.com')).thenResolve(expiredUser);
    
          await expect(userService.resetPassword(
            'expired@example.com', 
            expiredUser.resetCode.code, 
            'NewPassword1!'
          )).rejects.toThrow(BadRequestError);
        });
      });
    
      describe('resendActivationCode', () => {
        it('should generate new activation code for inactive user', async () => {
          const inactiveUser = User.create({
            email: 'inactive@example.com',
            password: 'hashedpassword',
            role: Role.USER
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
            role: Role.USER
          });
    
          when(mockUserRepository.getUserByEmail('inactive@example.com')).thenResolve(inactiveUser);
    
          await expect(userService.resendActivationCode('inactive@example.com'))
            .rejects.toThrow(BadRequestError);
        });
    });
});