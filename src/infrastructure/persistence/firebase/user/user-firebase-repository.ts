import { injectable } from "inversify";
import { User } from "../../../../domain/entities/user";
import IUserRepository from "../../../../domain/repositories/user-repository";
import * as admin from "firebase-admin";
import { Code } from "../../../../domain/entities/code";

@injectable()
export default class FireBaseUserRepository implements IUserRepository {
    getByGoogleId(googleId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    async createUser(user: User): Promise<User> {
        try {
            await admin.auth().createUser({
                uid: user.uid,
                email: user.email,
                password: user.password
            });

            const activationLink = await admin.auth().generateEmailVerificationLink(user.email);
            
            const newUser = User.create({
                uid: user.uid,
                email: user.email,
                password: "",
                isActive: false,
                activationCode: new Code(activationLink)
            });
            
            return newUser;
        } catch (error) {
            throw error;
        }

    }
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);

            return User.create({
                uid: userRecord.uid,
                email: userRecord.email,
                password: "",
                isActive: userRecord.emailVerified
            })

        } catch (error) {
            return null;
        }
    }
    async getUserById(uid: string): Promise<User | null> {
        try {
            const userRecord = await admin.auth().getUser(uid);

            return User.create({
                uid: userRecord.uid,
                email: userRecord.email,
                password: "",
                isActive: userRecord.emailVerified
            })

        } catch (error) {
            return null;
        }
    }
    // no need to implement because the user is activated by google link
    updateUser(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async deleteUser(uid: string): Promise<void> {
        try {
            await admin.auth().deleteUser(uid);
        } catch (error) {
            throw error;
        }
    }

}