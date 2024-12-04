import { User } from "../../../domain/entities/user";
import IUserRepository from "../../../domain/repositories/user-repository";

export class UserInmemoryRepository implements IUserRepository{
    private users: User[] = [];
    
    async createUser(user: User): Promise<User> {
        this.users.push(user);
        return Promise.resolve(user);
    }
    async getUserByEmail(email: string): Promise<User | null> {
        const user = this.users.find(u => u.email === email);
        return Promise.resolve(user || null);
    }
    async getUserById(uid: string): Promise<User | null> {
        const user = this.users.find(u => u.uid === uid);
        return Promise.resolve(user || null);
    }
    async updateUser(user: User): Promise<void> {
        const index = this.users.findIndex(u => u.uid === user.uid);
        this.users[index] = user;
    }
    async deleteUser(uid: string): Promise<void> {
        this.users = this.users.filter(u => u.uid !== uid);
    }

}