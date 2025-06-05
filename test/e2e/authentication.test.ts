import request from 'supertest';
import { app, myContainer } from '../setup';
import IUserRepository from '../../src/domain/repositories/user-repository';
import { TYPES } from '../../src/dependency-injection/types';
import { Code } from '../../src/domain/entities/code';

describe('Authentication API', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'ValidPassword1!'
    }

    let token: string;
    let refreshToken: string;

    describe('POST /api/user', () => {
        it('should return 202 for new user', async () => {
            const response = await request(app)
                .post('/api/user')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('uid');
            expect(response.body).toHaveProperty('email');
        });

        it('should return 403 for existing email', async () => {
            const existingUser = {
                ...testUser,
            }
            const response = await request(app)
                .post('/api/user')
                .send(existingUser)
                .expect(403);

            expect(response.body.message).toBe('User already registered');
        });

        it('should return 400 for invalid email format', async () => {
            const invalidUser = {
                ...testUser,
                email: 'invalid-email'
            }
            const response = await request(app)
                .post('/api/user')
                .send(invalidUser)
                .expect(400);

            expect(response.body.message).toBe('Email must be valid');
        });

        it('should return 400 for weak password', async () => {
            const weakUser = {
                email: 'weakpass@example.com',
                password: 'weak'
            }
            const response = await request(app)
                .post('/api/user')
                .send(weakUser)
                .expect(400);

            expect(response.body.message).toBe('Password does not meet requirements');
        });
    });

    describe('POST /api/user/resend-activation-code', () => {
        it('should return 400 when requested before expiration', async () => {
            const response = await request(app)
                .post('/api/user/resend-activation-code')
                .send({ email: testUser.email })
                .expect(400);

            expect(response.body.message).toBe('You\'ve already requested an activation code. Please wait for the code to expire before requesting a new one.');
        });

        it('should return 404 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/user/resend-activation-code')
                .send({ email: 'nonvalidemail@mail.com' })
                .expect(404);
            expect(response.body.message).toBe('User not Found');
        });

        it('should return 200 and resend activation code', async () => {
            const userRepository = myContainer.get<IUserRepository>(TYPES.IUserRepository);
            const user = await userRepository.getUserByEmail(testUser.email);
            user?.setActivationCode(new Code(user.activationCode.code, new Date(Date.now() - 1000 * 60 * 60 * 2)));
            await userRepository.updateUser(user!);
            const response = await request(app)
                .post('/api/user/resend-activation-code')
                .send({ email: testUser.email })
                .expect(200);

        });
    })

    describe('GET /api/user/activate', () => {
        it('should return 400 for invalid activation code', async () => {
            const response = await request(app)
                .get(`/api/user/activate/${testUser.email}/invalid-code`)
                .expect(400);

            expect(response.body.message).toBe('Invalid activation code');
        });

        it('should activate user with valid code', async () => {
            const userRepository = myContainer.get<IUserRepository>(TYPES.IUserRepository);
            const user = await userRepository.getUserByEmail(testUser.email);

            const response = await request(app)
                .get(`/api/user/activate/${testUser.email}/${user!.activationCode.code}`)
                .expect(200);
        });
    });

    describe('POST /api/signin', () => {
        it('should return 200 with tokens for valid credentials', async () => {
            const response = await request(app)
                .post('/api/signin')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');

            refreshToken = response.body.refreshToken; // Store refresh token for later tests
        });

        it('should return 400 for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/signin')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(400);

            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should return 400 for missing credentials', async () => {
            const response = await request(app)
                .post('/api/signin')
                .send({})
                .expect(400);

            expect(response.body.message).toBe('Email must be valid');
        });
    });

    describe('POST /api/refreshtoken', () => {
        it('should return 200 with new tokens for valid refresh token', async () => {
            const response = await request(app)
                .post('/api/refreshtoken')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');
            token = response.body.token; // Store new token for later tests
            refreshToken = response.body.refreshToken; // Update refresh token
        });

        it('should return 400 for invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/refreshtoken')
                .send({ refreshToken: 'invalid-token' })
                .expect(400);

            expect(response.body.message).toBe('Invalid refresh token');
        });
    });

    describe('PUT /api/user/change-password', () => {
        it('should return 404 for missing token', async () => {
            const response = await request(app)
                .put('/api/user/change-password')
                .send({
                    password: testUser.password,
                    newPassword: 'NewValidPassword1!'
                })
                .expect(400);

            expect(response.body.message).toBe('Invalid token');
        });

        it('should return 404 for wrong password', async () => {
            const response = await request(app)
                .put('/api/user/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'wrongpassword',
                    newPassword: 'NewValidPassword1!'
                })
                .expect(404);

            expect(response.body.message).toBe('User not Found');

        });

        it('should return 204 for valid password change', async () => {
            const response = await request(app)
                .put('/api/user/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password,
                    newPassword: 'NewValidPassword1!'
                })
                .expect(204);
        });

        //-- login with new password
        it('should return 200 with tokens for valid credentials', async () => {
            const response = await request(app)
                .post('/api/signin')
                .send({
                    email: testUser.email,
                    password: 'NewValidPassword1!'
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');

            token = response.body.token; // Store new token for later tests
            refreshToken = response.body.refreshToken; // Store refresh token for later tests
        });
    });

    describe('POST /api/user/reset-password-request', () => {
        it('should return 404 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/user/reset-password-request')
                .send({ email: 'nonexisting@mail.com' })
                .expect(404);
            expect(response.body.message).toBe('User not Found');
        });
        it('should return 200 and send reset code for existing user', async () => {
            const response = await request(app)
                .post('/api/user/reset-password-request')
                .send({ email: testUser.email })
                .expect(200);
        });
    });

    describe('POST /api/user/reset-password', () => {
        it('should return 404 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/user/reset-password')
                .send({
                    email: 'nonexisting@mail.com',
                    resetCode: 'invalid-code',
                    newPassword: 'NewValidPassword2!'
                })
                .expect(404);
            expect(response.body.message).toBe('User not Found');
        });

        it('should return 404 for invalid reset code', async () => {
            const response = await request(app)
                .post('/api/user/reset-password')
                .send({
                    email: testUser.email,
                    resetCode: 'invalid-code',
                    newPassword: 'NewValidPassword2!'
                })
                .expect(404);
            expect(response.body.message).toBe('User not Found');
        });

        it('should return 400 for invalid new password', async () => {
            const userRepository = myContainer.get<IUserRepository>(TYPES.IUserRepository);
            const user = await userRepository.getUserByEmail(testUser.email);

            const response = await request(app)
                .post('/api/user/reset-password')
                .send({
                    email: testUser.email,
                    resetCode: user!.resetCode.code,
                    newPassword: 'weak'
                })
                .expect(400);
            expect(response.body.message).toBe('Password does not meet requirements');
        });

        it('should return 204 for valid reset password', async () => {
            const userRepository = myContainer.get<IUserRepository>(TYPES.IUserRepository);
            const user = await userRepository.getUserByEmail(testUser.email);

            const response = await request(app)
                .post('/api/user/reset-password')
                .send({
                    email: testUser.email,
                    resetCode: user!.resetCode.code,
                    newPassword: 'NewValidPassword2!'
                })
                .expect(204);
        });

        //-- login with new password
        it('should return 200 with tokens for valid credentials', async () => {
            const response = await request(app)
                .post('/api/signin')
                .send({
                    email: testUser.email,
                    password: 'NewValidPassword2!'
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');

            token = response.body.token; // Store new token for later tests
            refreshToken = response.body.refreshToken; // Store refresh token for later tests
        });
    });

    describe('POST /api/validate-token', () => {
        it('should return 200 for valid token', async () => {
            const response = await request(app)
                .post('/api/validate-token')
                .send({
                    token: token
                })
                .expect(200);

            expect(response.body).toHaveProperty('uid');
            expect(response.body).toHaveProperty('email');
        });

        it('should return 400 for invalid token', async () => {
            const response = await request(app)
                .post('/api/validate-token')
                .send({
                    token: 'invalid-token'
                })
                .expect(400);

            expect(response.body.message).toBe('Invalid token');
        });
    });
});