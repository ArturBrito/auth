import { AuthDto } from "../domain/dto/auth-dto";
import IAuthService from "./contracts/auth-service-contract";

export default class AuthService implements IAuthService {
    async signIn(email: string, password: string): Promise<AuthDto> {
        throw new Error("Method not implemented.");
    }
}