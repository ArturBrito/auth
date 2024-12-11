import { NextFunction, Request, Response } from "express";

export default interface IUserController {
    createUser(req: Request, res: Response, next: NextFunction);
    getUserByEmail(req: Request, res: Response, next: NextFunction);
    activateUser(req: Request, res: Response, next: NextFunction);
}