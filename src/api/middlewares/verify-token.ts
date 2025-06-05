import { inject, injectable } from "inversify";
import IVerifyToken from "./contracts/verify-token.contract";
import { Request, Response, NextFunction } from "express";
import { UserDto } from "../../domain/dto/user-dto";
import ITokenManager from "../../services/contracts/token-manager-contract";
import { TYPES } from "../../dependency-injection/types";
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
    private tokenManager: ITokenManager;
    constructor(
        @inject(TYPES.ITokenManager) tokenManager: ITokenManager,
    ) {
        this.tokenManager = tokenManager;
        this.verifyToken = this.verifyToken.bind(this);
    }

    async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idToken = req.headers.authorization?.split('Bearer ')[1];

            if (!idToken) {
                throw new BadRequestError('Invalid token');
            }

            const decodedToken = await this.tokenManager.verify(idToken);

            if (!decodedToken) {
                throw new BadRequestError('Invalid token');
            }

            if (!decodedToken.isActive) {
                throw new BadRequestError('User is inactive');
            }

            req.currentUser = UserMapper.tokenToDto(decodedToken);
            next();
        } catch (error) {
            next(new BadRequestError('Invalid token'));
        }
    }

}