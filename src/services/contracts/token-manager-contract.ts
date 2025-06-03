import { AuthDto } from "../../domain/dto/auth-dto";

export default interface ITokenManager {
    sign(payload: any): Promise<AuthDto>;
    verify(token: string): Promise<any>;
}