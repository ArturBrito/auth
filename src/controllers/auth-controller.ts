import { Request, Response, NextFunction } from "express";
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
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const tokens = await this.authService.refreshToken(refreshToken);
            res.status(200).json(tokens);
        } catch (error) {
            next(error);
        }
    }
    async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const tokens = await this.authService.signIn(email, password);
            res.status(200).json(tokens);
        } catch (error) {
            next(error);
        }
    }

}