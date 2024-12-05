import { Request, Response, NextFunction } from "express";
import IUserService from "../services/contracts/user-service-contract";
import IUserController from "./contracts/user-controller-contract";
import { UserDto } from "../domain/dto/user-dto";
import { inject, injectable } from "inversify";
import { TYPES } from "../dependency-injection/types";
import IAuthController from "./contracts/auth-controller-contract";
import IAuthService from "../services/contracts/auth-service-contract";

@injectable()
export default class AuthController implements IAuthController {
    private authService: IAuthService;
    constructor(
        @inject(TYPES.IAuthService) authService: IAuthService
    ) {
        this.authService = authService;
    }
    async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const tokens = await this.authService.signIn(email, password);
            res.status(200).json(tokens);
        } catch (error) {
            throw error;
        }
    }

}