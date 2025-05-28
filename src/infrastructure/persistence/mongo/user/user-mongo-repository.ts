import { injectable } from "inversify";
import IUserRepository from "../../../../domain/repositories/user-repository";
import { User } from "../../../../domain/entities/user";
import { IUserPersistence } from "../../../../data-model/user.datamodel";
import UserMapper from "../../../../domain/mapper/user-mapper";
import UserModel from "../../../../data-model/user.schema";
import UserResetPasswordCodeModel from "../../../../data-model/user-reset-password-code.schema";
import { Code } from "../../../../domain/entities/code";

@injectable()
export default class UserMongoRepository implements IUserRepository {
    async getByGoogleId(googleId: string): Promise<User | null> {
        try {
            const query = { googleId: googleId };
            const user = await UserModel.findOne(query);
            if (!user) return null;
            return UserMapper.toEntity(user);
        } catch (error) {
            throw error;
        }
    }
    async createUser(user: User): Promise<User> {
        try {
            const userPersistence: IUserPersistence = UserMapper.toPersistence(user);
            const userCreated = await UserModel.create(userPersistence);
            return UserMapper.toEntity(userCreated);
        } catch (error) {
            throw error;
        }
    }
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const query = { email: email };
            const user = await UserModel.findOne(query);
            if (!user) return null;
            const userResetCode = await UserResetPasswordCodeModel.findOne({ email: email });

            const userEntity = UserMapper.toEntity(user);
            if (userResetCode) {
                userEntity.setResetCode(new Code(userResetCode.resetCode, userResetCode.createdAt));
            }
            //return UserMapper.toEntity(user);
            return userEntity;
        } catch (error) {
            throw error;
        }
    }
    async getUserById(uid: string): Promise<User | null> {
        try {
            const query = { uid: uid };
            const user = await UserModel.findOne(query);
            if (!user) return null;
            return UserMapper.toEntity(user);
        } catch (error) {
            throw error;
        }
    }
    async updateUser(user: User): Promise<void> {
        try {
            const userPersistence: IUserPersistence = UserMapper.toPersistence(user);
            await UserModel.updateOne({ uid: userPersistence.uid }, userPersistence);
            if (user.resetCode) {
                const resetCodePersistence = {
                    email: userPersistence.email,
                    resetCode: user.resetCode.code,
                    createdAt: user.resetCode.createdAt
                };
                await UserResetPasswordCodeModel.updateOne({ email: userPersistence.email }, resetCodePersistence, { upsert: true });
            } else {
                await UserResetPasswordCodeModel.deleteOne({ email: userPersistence.email });
            }
        } catch (error) {
            throw error;
        }
    }
    async deleteUser(uid: string): Promise<void> {
        try {
            await UserModel.deleteOne({ uid: uid });
        } catch (error) {
            throw error;
        }
    }

}