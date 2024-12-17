import { NextFunction, Request, Response } from "express";

export default interface IUserController {
    createUser(req: Request, res: Response, next: NextFunction);
    getUserByEmail(req: Request, res: Response, next: NextFunction);
    activateUser(req: Request, res: Response, next: NextFunction);
    deleteUser(req: Request, res: Response, next: NextFunction);
    changePassword(req: Request, res: Response, next: NextFunction);
    resetPasswordRequest(req: Request, res: Response, next: NextFunction);
    resetPassword(req: Request, res: Response, next: NextFunction);
    resendActivationCode(req: Request, res: Response, next: NextFunction);
}