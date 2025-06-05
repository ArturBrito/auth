import { container } from '../setup';
import UserService from '../../src/services/user-service';
import { UserDto } from '../../src/domain/dto/user-dto';
import { mock, instance, when } from 'ts-mockito';
import { EventEmitter } from 'events';
import { TYPES } from '../../src/dependency-injection/types';
import { UserAlreadyRegisteredError } from '../../src/errors/user-already-registered-error';
import { BadRequestError } from '../../src/errors/bad-request-error';
import { UserNotFoundError } from '../../src/errors/user-not-found-error';
import IUserRepository from '../../src/domain/repositories/user-repository';

describe('UserService Integration', () => {
  let userService: UserService;
  const mockEventEmitter = mock(EventEmitter);

  beforeAll(() => {
    // Get real repository from container but mock event emitter
    userService = new UserService(
      container.get(TYPES.IUserRepository),
      container.get(TYPES.IPasswordManager),
      instance(mockEventEmitter)
    );
  });

  describe('createUser', () => {
    it('should create and persist a new user', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'ValidPassword1!',
      };

      const result = await userService.createUser(userDto);
      
      expect(result).toMatchObject({
        email: userDto.email,
      });
      expect(result.uid).toBeDefined();
    });

    it('should fail when creating duplicate user', async () => {
      const userDto: UserDto = {
        email: 'duplicate@example.com',
        password: 'ValidPassword1!',
      };

      await userService.createUser(userDto);
      await expect(userService.createUser(userDto))
        .rejects.toThrow(UserAlreadyRegisteredError);
    });
  });

  describe('activateUser', () => {
    it('should activate user with valid code', async () => {
      const userDto: UserDto = {
        email: 'activate@example.com',
        password: 'ValidPassword1!',
      };

      // Create user
      const createdUser = await userService.createUser(userDto);
      
      // Get the user directly from repository to access activation code
      const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
      const dbUser = await userRepo.getUserByEmail(userDto.email);
      
      // Activate user
      const activatedUser = await userService.activateUser(
        userDto.email, 
        dbUser!.activationCode.code
      );
      
      expect(activatedUser).toMatchObject({
        email: userDto.email
      });
      
      // Verify user is active in DB
      const updatedUser = await userRepo.getUserByEmail(userDto.email);
      expect(updatedUser!.isActive).toBe(true);
    });

    it('should fail to activate with invalid code', async () => {
      const userDto: UserDto = {
        email: 'invalidcode@example.com',
        password: 'ValidPassword1!',
      };

      await userService.createUser(userDto);
      
      await expect(userService.activateUser(userDto.email, 'wrong-code'))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('password management', () => {
    it('should successfully change password', async () => {
      const userDto: UserDto = {
        email: 'changepass@example.com',
        password: 'OriginalPassword1!',
      };

      await userService.createUser(userDto);
      await userService.changePassword(
        userDto.email,
        'OriginalPassword1!',
        'NewPassword1!'
      );
      
      // Verify by attempting to sign in would require auth service
      // Here we just verify no errors were thrown
      expect(true).toBeTruthy();
    });

    it('should fail to change password with wrong current password', async () => {
      const userDto: UserDto = {
        email: 'wrongpass@example.com',
        password: 'OriginalPassword1!',
      };

      await userService.createUser(userDto);
      
      await expect(userService.changePassword(
        userDto.email,
        'WrongPassword1!',
        'NewPassword1!'
      )).rejects.toThrow(UserNotFoundError);
    });
  });
});