import { UserDto } from "../../domain/dto/user-dto";

export default interface IUserService {
    createUser(userDto: UserDto): Promise<UserDto>;
    getUserByEmail(email: string): Promise<UserDto | null>;
    activateUser(email: string, activationCode: string): Promise<UserDto>;
    deleteUser(user: UserDto): Promise<void>;
    changePassword(email:string, password: string, newPassword: string): Promise<void>;
    resetPasswordRequest(email: string): Promise<void>;
    resetPassword(email: string, resetCode: string, newPassword: string): Promise<void>;
    resendActivationCode(email: string): Promise<void>;
}