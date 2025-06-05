import { IUserPersistence } from "../../data-model/user.datamodel";
import UserCodesDto from "../dto/user-codes-dto";
import { UserDto } from "../dto/user-dto";
import { User } from "../entities/user";

export default class UserMapper {
    static toDto(user: User): UserDto {
        return {
            uid: user.uid,
            email: user.email,
        };
    }
    static toEntity(userPersistence: IUserPersistence): User {
        const user = User.create({
            uid: userPersistence.uid,
            email: userPersistence.email,
            createdAt: userPersistence.createdAt,
            isActive: userPersistence.isActive,
            password: userPersistence.password,
            googleId: userPersistence.googleId,
        });
        return user;
    }
    static tokenToDto(user: {uid: string, email: string}): UserDto {
        return {
            uid: user.uid,
            email: user.email,
        };
    }
    static toPersistence(user: User): IUserPersistence {
        return {
            uid: user.uid,
            email: user.email,
            password: user.password,
            createdAt: user.createdAt,
            isActive: user.isActive,
            googleId: user.googleId,
        };
    }
    static toUserCodesDto(user: User) : UserCodesDto {
        return {
            email: user.email,
            activationCode: user.activationCode ? user.activationCode.code : null,
            resetCode: user.resetCode ? user.resetCode.code : null
        };
    }
}