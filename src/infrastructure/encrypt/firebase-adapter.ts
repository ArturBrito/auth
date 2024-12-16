import { injectable } from "inversify";
import IEncrypter from "../../services/contracts/encrypter-contract";
import { AuthDto } from "../../domain/dto/auth-dto";
import * as admin from 'firebase-admin';

@injectable()
export default class FirebaseEncryptorAdapter implements IEncrypter {
    async encrypt(payload: any): Promise<AuthDto> {
        throw new Error("Method not implemented.");
    }
    async decrypt(token: string): Promise<any> {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role,
            isActive: decodedToken.email_verified
        };
    }
}