import { AuthDto } from "../../domain/dto/auth-dto";

export default interface IEncrypter {
    encrypt(payload: any): Promise<AuthDto>;
    decrypt(token: string): Promise<any>;
}