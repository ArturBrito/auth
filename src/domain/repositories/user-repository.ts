import { User } from "../entities/user";

export default interface IUserRepository {
    createUser(user: User): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(uid: string): Promise<User | null>;
    updateUser(user: User): Promise<void>;
    deleteUser(uid: string): Promise<void>;
}