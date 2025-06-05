import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../errors/custom-error';
import logger from '../../helpers/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.serializeErrors());
  }

  logger.error(err);
  
  res.status(400).send({
    message: 'Something went wrong'
  });
};
