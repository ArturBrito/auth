import { NextFunction, Request, Response } from "express";

export default interface IAuthController {
    signIn(req: Request, res: Response, next: NextFunction);
    refreshToken(req: Request, res: Response, next: NextFunction);
    googleSignIn(req: Request, res: Response, next: NextFunction);
    googleCallback(req: Request, res: Response, next: NextFunction);
    validateToken(req: Request, res: Response, next: NextFunction);
}