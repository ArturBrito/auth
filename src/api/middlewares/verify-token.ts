import { inject, injectable } from "inversify";
import IVerifyToken from "./contracts/verify-token.contract";
import { Request, Response, NextFunction } from "express";
import { UserDto } from "../../domain/dto/user-dto";
import IEncrypter from "../../services/contracts/encrypter-contract";
import { TYPES } from "../../dependency-injection/types";
import { InvalidTokenError } from "../../errors/invalid-token-error";
import UserMapper from "../../domain/mapper/user-mapper";
import { BadRequestError } from "../../errors/bad-request-error";

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserDto | any;
        }
    }
}

@injectable()
export default class VerifyToken implements IVerifyToken {
    private encrypter: IEncrypter;
    constructor(
        @inject(TYPES.IEncrypter) encrypter: IEncrypter,
    ) {
        this.encrypter = encrypter;
        this.verifyToken = this.verifyToken.bind(this);
    }

    async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];

            if (!idToken) {
                throw new InvalidTokenError();
            }

            const decodedToken = await this.encrypter.decrypt(idToken);

            if (!decodedToken) {
                throw new InvalidTokenError();
            }

            if (!decodedToken.isActive) {
                throw new BadRequestError('User is inactive');
            }

            req.currentUser = UserMapper.tokenToDto(decodedToken);
            next();
        } catch (error) {
            next(new InvalidTokenError());
        }
    }

}