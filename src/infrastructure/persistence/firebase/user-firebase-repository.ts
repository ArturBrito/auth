import { User } from "../../../domain/entities/user";
import IUserRepository from "../../../domain/repositories/user-repository";
import * as admin from "firebase-admin";

export default class FireBaseUserRepository implements IUserRepository {
    async createUser(user: User): Promise<User> {
        try {
            await admin.auth().createUser({
                uid: user.uid,
                email: user.email,
                password: user.password
            });

            await admin.auth().setCustomUserClaims(user.uid, {
                role: user.role
            });
            const activationLink = await admin.auth().generateEmailVerificationLink(user.email);

            const newUser = User.create({
                uid: user.uid,
                email: user.email,
                password: "",
                role: user.role,
                isActive: false,
                activationCode: activationLink
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
                role: userRecord.customClaims.role,
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
                role: userRecord.customClaims.role,
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