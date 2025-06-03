import { AuthDto } from "../../domain/dto/auth-dto";
import fs from "fs";
import path from "path";
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { injectable } from "inversify";
import ITokenManager from "../../services/contracts/token-manager-contract";

const privateKey = fs.readFileSync(path.join(__dirname, '../../../rs256.rsa'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, '../../../rs256.rsa.pub'), 'utf8');

@injectable()
export default class JwtAdapter implements ITokenManager {
    async sign(payload: any): Promise<AuthDto> {
        const signInOptions: SignOptions = {
            algorithm: 'RS256',
            expiresIn: '3h',
        };

        const refreshTokenOptions: SignOptions = {
            algorithm: 'RS256',
            expiresIn: '1d',
        };


        const token = jwt.sign(
            payload,
            privateKey,
            signInOptions
        );

        const refreshToken = jwt.sign(
            payload,
            privateKey,
            refreshTokenOptions
        );


        return {
            token,
            refreshToken
        };

    }
    async verify(token: string): Promise<any> {
        const verifyOptions: VerifyOptions = {
            algorithms: ['RS256']
        };

        return jwt.verify(token, publicKey, verifyOptions);
    }

}