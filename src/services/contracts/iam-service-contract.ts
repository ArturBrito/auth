import { AuthDto } from "../../domain/dto/auth-dto";

export default interface IAuthIAMService {
    login(provider: string, scope: string[]): (req: any, res: any, next: any) => void;
    callback(provider: string): (req: any, res: any, next: any) => void;
}