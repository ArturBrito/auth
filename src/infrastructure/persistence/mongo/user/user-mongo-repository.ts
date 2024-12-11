import { injectable } from "inversify";
import IUserRepository from "../../../../domain/repositories/user-repository";
import { User } from "../../../../domain/entities/user";
import { IUserPersistence } from "../../../../data-model/user.datamodel";
import UserMapper from "../../../../domain/mapper/user-mapper";
import UserModel from "./user.schema";

@injectable()
export default class UserMongoRepository implements IUserRepository {
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
            if(!user) return null;
            return UserMapper.toEntity(user);
        } catch (error) {
            throw error;
        }
    }
    async getUserById(uid: string): Promise<User | null> {
        try {
            const query = { uid: uid };
            const user = await UserModel.findOne(query);
            if(!user) return null;
            return UserMapper.toEntity(user);
        } catch (error) {
            throw error;
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
            await UserModel.deleteOne({ uid: uid });
        } catch (error) {
            throw error;
        }
    }

}