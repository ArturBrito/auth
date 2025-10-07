import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../dependency-injection/types";
import IAuthController from "./contracts/auth-controller-contract";
import IAuthService from "../services/contracts/auth-service-contract";
import IAuthIAMService from "../services/contracts/iam-service-contract";

@injectable()
export default class AuthController implements IAuthController {
    private authService: IAuthService;
    private authIAMService: IAuthIAMService;
    constructor(
        @inject(TYPES.IAuthService) authService: IAuthService,
        @inject(TYPES.IAuthIAMService) authIAMService: IAuthIAMService
    ) {
        this.authService = authService;
        this.authIAMService = authIAMService;
    }
    async googleSignIn(req: Request, res: Response, next: NextFunction) {
        try {
            const handler = this.authIAMService.login('google', ['profile', 'email']);
            handler(req, res, next);
        } catch (error) {
            next(error);
        }
    }
    async googleCallback(req: Request, res: Response, next: NextFunction) {
        try {
            const handler = this.authIAMService.callback('google');
            handler(req, res, next);
        } catch (error) {
            next(error)
        }
    }
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            const tokens = await this.authService.refreshToken(refreshToken);
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            };
            res.cookie('token', tokens.token, cookieOptions);
            res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
            res.status(200).json(tokens);
        } catch (error) {
            next(error);
        }
    }
    async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const tokens = await this.authService.signIn(email, password);
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as 'lax',
                maxAge: 3 * 60 * 60 * 1000 // 3 hours
            };
            res.cookie('token', tokens.token, cookieOptions);
            res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
            res.status(200).json(tokens);
        } catch (error) {
            next(error);
        }
    }
    async validateToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.body;
            const isValid = await this.authService.validateToken(token);
            res.status(200).json(isValid);
        } catch (error) {
            next(error);
        }
    }
    async signOut(req: Request, res: Response, next: NextFunction) {
        try {
            // Prefer cookie refreshToken, fallback to body
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (refreshToken) {
                await this.authService.signOut(refreshToken);
            }

            // Clear cookies
            res.clearCookie('token');
            res.clearCookie('refreshToken');

            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}