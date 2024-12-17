import { IUserPersistence } from "../../data-model/user.datamodel";
import UserCodesDto from "../dto/user-codes-dto";
import { UserDto } from "../dto/user-dto";
import { Role, User } from "../entities/user";

export default class UserMapper {
    static toDto(user: User): UserDto {
        return {
            uid: user.uid,
            email: user.email,
            role: user.role
        };
    }
    static toEntity(userPersistence: IUserPersistence): User {
        const user = User.create({
            uid: userPersistence.uid,
            email: userPersistence.email,
            role: userPersistence.role as Role,
            createdAt: userPersistence.createdAt,
            isActive: userPersistence.isActive,
            password: userPersistence.password,
            activationCode: userPersistence.activationCode,
            googleId: userPersistence.googleId,
            resetCode: userPersistence.resetCode
        });
        return user;
    }
    static tokenToDto(user: {uid: string, email: string, role: string}): UserDto {
        return {
            uid: user.uid,
            email: user.email,
            role: user.role
        };
    }
    static toPersistence(user: User): IUserPersistence {
        return {
            uid: user.uid,
            email: user.email,
            password: user.password,
            role: user.role,
            createdAt: user.createdAt,
            isActive: user.isActive,
            activationCode: user.activationCode,
            googleId: user.googleId,
            resetCode: user.resetCode
        };
    }
    static toUserCodesDto(user: User) : UserCodesDto {
        return {
            email: user.email,
            activationCode: user.activationCode,
            resetCode: user.resetCode
        };
    }
}