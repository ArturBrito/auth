import { User } from '../../../src/domain/entities/user';
import { Code } from '../../../src/domain/entities/code';
import { InvalidUserError } from '../../../src/errors/invalid-user-error';
import { BadRequestError } from '../../../src/errors/bad-request-error';

describe('User', () => {
    const validProps = {
        email: 'test@example.com',
        password: 'ValidPassword1!',
    };

    describe('create', () => {
        it('should create a user with valid properties', () => {
            const user = User.create(validProps);

            expect(user).toBeInstanceOf(User);
            expect(user.email).toBe(validProps.email);
            expect(user.isActive).toBe(false);
            expect(user.activationCode).toBeDefined();
        });

        it('should generate a uid if none provided', () => {
            const user = User.create(validProps);
            expect(user.uid).toBeDefined();
            expect(user.uid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should use provided uid if available', () => {
            const testUid = 'test-uid';
            const user = User.create({ ...validProps, uid: testUid });
            expect(user.uid).toBe(testUid);
        });

        it('should throw InvalidUserError for missing email', () => {
            expect(() => User.create({ ...validProps, email: '' })).toThrow(InvalidUserError);
        });

        it('should throw InvalidUserError for invalid email format', () => {
            expect(() => User.create({ ...validProps, email: 'invalid-email' })).toThrow(InvalidUserError);
        });

        it('should throw InvalidUserError for missing password when not using Google', () => {
            expect(() => User.create({ ...validProps, password: '' })).toThrow(InvalidUserError);
        });

        it('should not require password when using Google', () => {
            const user = User.create({ ...validProps, password: '', googleId: 'google-id' });
            expect(user).toBeInstanceOf(User);
        });
    });

    describe('activateUser', () => {
        it('should activate user with correct activation code', () => {
            const user = User.create(validProps);
            const activationCode = user.activationCode.code;

            user.activateUser(activationCode);
            expect(user.isActive).toBe(true);
        });

        it('should throw BadRequestError with incorrect activation code', () => {
            const user = User.create(validProps);
            expect(() => user.activateUser('wrong-code')).toThrow(BadRequestError);
        });
    });

    describe('password management', () => {
        it('should set password', () => {
            const user = User.create(validProps);
            const newPassword = 'NewPassword1!';

            user.setPassword(newPassword);
            expect(user.password).toBe(newPassword);
        });
    });

    describe('code generation', () => {
        it('should generate reset code', () => {
            const user = User.create(validProps);
            user.generateResetCode();

            expect(user.resetCode).toBeDefined();
            expect(user.resetCode.code).toBeDefined();
        });

        it('should set reset code', () => {
            const user = User.create(validProps);
            const testCode = new Code('test-code');

            user.setResetCode(testCode);
            expect(user.resetCode).toBe(testCode);
        });

        it('should validate reset code correctly', () => {
            const user = User.create(validProps);
            user.generateResetCode();
            const resetCode = user.resetCode.code;

            expect(user.validateResetCode(resetCode)).toBe(true);
            expect(user.validateResetCode('wrong-code')).toBe(false);
        });

        it('should clear reset code', () => {
            const user = User.create(validProps);
            user.generateResetCode();
            user.clearResetCode();

            expect(user.resetCode).toBeNull();
        });

        it('should generate activation code', () => {
            const user = User.create(validProps);
            const oldCode = user.activationCode.code;
            user.generateActivationCode();

            expect(user.activationCode.code).toBeDefined();
            expect(user.activationCode.code).not.toBe(oldCode);
        });
    });

    describe('googleId management', () => {
        it('should set googleId', () => {
            const user = User.create(validProps);
            const googleId = 'new-google-id';

            user.setGoogleId(googleId);
            expect(user.googleId).toBe(googleId);
        });
    });
});