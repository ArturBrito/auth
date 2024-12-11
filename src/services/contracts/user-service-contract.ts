import { UserDto } from "../../domain/dto/user-dto";

export default interface IUserService {
    createUser(userDto: UserDto): Promise<UserDto>;
    getUserByEmail(email: string): Promise<UserDto | null>;
    activateUser(email: string, activationCode: string): Promise<UserDto>;
    deleteUser(user: UserDto): Promise<void>;
}