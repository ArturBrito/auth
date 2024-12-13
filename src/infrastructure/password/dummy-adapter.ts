import { injectable } from "inversify";
import IPasswordManager from "../../services/contracts/password-manager";

@injectable()
export default class PasswordDummyAdapter implements IPasswordManager{
    async hashPassword(password: string): Promise<string> {
        return password;
    }
    async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
        return password === hashedPassword;
    }

}