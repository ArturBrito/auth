import { injectable } from "inversify";
import ITokenManager from "../../services/contracts/token-manager-contract";
import { AuthDto } from "../../domain/dto/auth-dto";
import * as admin from 'firebase-admin';

@injectable()
export default class FirebaseTokenManagerAdapter implements ITokenManager {
    async sign(payload: any): Promise<AuthDto> {
        throw new Error("Method not implemented.");
    }
    async verify(token: string): Promise<any> {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            isActive: decodedToken.email_verified
        };
    }
}