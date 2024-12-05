import { NextFunction, Request, Response } from "express";

export default interface IAuthController {
    signIn(req: Request, res: Response, next: NextFunction);
}