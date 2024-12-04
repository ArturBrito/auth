import { injectable } from "inversify";
import IPasswordManager from "../../services/contracts/password-manager";

import bcrypt from 'bcrypt';

@injectable()
export default class BcryptAdapter implements IPasswordManager {
    private readonly saltRounds = 10;

    constructor() { }

    async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            throw new Error('Error hashing password');
        }
    }

    async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(password, hashedPassword);
            return isMatch;
        } catch (error) {
            throw new Error('Error comparing passwords');
        }
    }

}