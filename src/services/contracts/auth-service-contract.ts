import { AuthDto } from "../../domain/dto/auth-dto";

export default interface IAuthService {
    signIn(email: string, password: string): Promise<AuthDto>;
    refreshToken(refreshToken: string): Promise<AuthDto>;
    signOut(refreshToken: string): Promise<void>;
}