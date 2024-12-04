import { UserDto } from "../../domain/dto/user-dto";
import { User } from "../../domain/entities/user";

export default interface IUserService {
    createUser(userDto: UserDto): Promise<UserDto>;
}