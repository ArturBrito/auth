import { UserDto } from "../../domain/dto/user-dto";
import { User } from "../../domain/entities/user";

export default interface IUserService {
    createUser(userDto: UserDto): Promise<UserDto>;
    getUserByEmail(email: string): Promise<UserDto | null>;
    activateUser(email: string, activationCode: string): Promise<UserDto>;
}