import { NextFunction, Response, Request } from 'express';

export default interface IVerifyToken {
    verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}