import { AuthDto } from "../../domain/dto/auth-dto";
import IEncrypter from "../../services/contracts/encrypter-contract";
import fs from "fs";
import path from "path";
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

const privateKey = fs.readFileSync(path.join(__dirname, '../../../rs256.rsa'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, '../../../rs256.rsa.pub'), 'utf8');


export default class JwtAdapter implements IEncrypter {
    async encrypt(payload: any): Promise<AuthDto> {
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
    async decrypt(token: string): Promise<any> {
        throw new Error("Method not implemented.");
    }

}