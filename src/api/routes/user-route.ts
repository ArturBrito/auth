import { Router, Request, Response, NextFunction } from 'express';
import IUserController from '../../controllers/contracts/user-controller-contract';
import { myContainer } from '../../dependency-injection/inversify.config';
import { TYPES } from '../../dependency-injection/types';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';

const router = Router();

export default (app: Router) => {
    console.log('User route loaded');
    const ctrl = myContainer.get<IUserController>(TYPES.IUserController);

    app.use('/user', router);

    router.post('', 
        [
            body('email')
                .isEmail()
                .withMessage('Email must be valid'),
            body('password')
                .trim()
                .notEmpty()
                .withMessage('You must supply a password')
        ],
        validateRequest,
        (req: Request, res: Response, next: NextFunction) => ctrl.createUser(req, res, next));
    router.get('/:email', (req, res, next) => ctrl.getUserByEmail(req, res, next));
}