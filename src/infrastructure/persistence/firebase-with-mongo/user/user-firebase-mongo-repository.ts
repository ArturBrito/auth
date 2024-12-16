import { injectable } from "inversify";
import IUserRepository from "../../../../domain/repositories/user-repository";
import { User } from "../../../../domain/entities/user";
import { IUserPersistence } from "../../../../data-model/user.datamodel";
import UserMapper from "../../../../domain/mapper/user-mapper";
import UserModel from "../../../../data-model/user.schema";
import * as admin from "firebase-admin";

@injectable()
export default class UserFirebaseWithMongoRepository implements IUserRepository {
    getByGoogleId(googleId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    async createUser(user: User): Promise<User> {
        let userCreated: IUserPersistence;
        try {
            const userPersistence: IUserPersistence = UserMapper.toPersistence(user);
            userCreated = await UserModel.create(userPersistence);

        } catch (error) {
            throw error;
        }

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
            await UserModel.deleteOne({ uid: userCreated.uid }).catch(err => console.log(err));
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
    async updateUser(user: User): Promise<void> {
        try {
            const userPersistence: IUserPersistence = UserMapper.toPersistence(user);
            await UserModel.updateOne({ uid: userPersistence.uid }, userPersistence);
        } catch (error) {
            throw error;
        }
    }
    async deleteUser(uid: string): Promise<void> {
        try {
            await admin.auth().deleteUser(uid);
            await UserModel.deleteOne({ uid: uid });
        } catch (error) {
            throw error;
        }
    }

}