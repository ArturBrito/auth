import { User } from "../../src/domain/entities/user";

describe('User', () => {
    describe('createUser', () => {
        it('should create a new user', async () => {
            const user = User.create({
                email: 'artur.brito95@gmail.com',
                password: 'hashedPassword',
                role: 'user'
            });

            expect(user).toBeDefined();
            expect(user.uid).toBeDefined();
            expect(user.email).toBe('artur.brito95@gmail.com');
            expect(user.role).toBe('user');
        });

        it('should throw an error if the email is not valid', async () => {
            try {
                User.create({
                    email: 'fasfdsaf',
                    password: 'hashedPassword',
                    role: 'user'
                });
            } catch (error) {
                expect(error.message).toBe('Invalid user');
                expect(error.reason).toBe('Email is not a valid email.');
            }
        });
    });
});