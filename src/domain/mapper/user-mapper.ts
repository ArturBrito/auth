import { UserDto } from "../dto/user-dto";
import { Role, User } from "../entities/user";

export default class UserMapper {
    static toDto(user: User): UserDto {
        return {
            uid: user.uid,
            email: user.email,
            role: user.role,
            password: user.password
        };
    }
    static toEntity(userDto: UserDto): User {
        const user = User.create({
            uid: userDto.uid,
            email: userDto.email,
            role: userDto.role as Role,
            password: userDto.password
        });
        return user;
    }
}