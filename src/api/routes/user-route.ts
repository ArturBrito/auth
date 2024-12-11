import { Router, Request, Response, NextFunction } from 'express';
import IUserController from '../../controllers/contracts/user-controller-contract';
import { myContainer } from '../../dependency-injection/inversify.config';
import { TYPES } from '../../dependency-injection/types';
import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';
import IVerifyToken from '../middlewares/contracts/verify-token.contract';

const router = Router();

export default (app: Router) => {

    const ctrl = myContainer.get<IUserController>(TYPES.IUserController);
    const verifyToken = myContainer.get<IVerifyToken>(TYPES.IVerifyToken);

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
    router.get('/:email',
        [
            param('email')
                .isEmail()
                .withMessage('Email must be valid'),
        ],
        validateRequest,
        (req: Request, res: Response, next: NextFunction) => ctrl.getUserByEmail(req, res, next));
    router.put('/activate/:email/:activationCode',
        [
            param('email')
                .isEmail()
                .withMessage('Email must be valid'),
            param('activationCode')
                .trim()
                .notEmpty()
                .withMessage('You must supply an activation code')
        ],
        validateRequest,
        (req: Request, res: Response, next: NextFunction) => ctrl.activateUser(req, res, next));
    router.delete('/:email',
        [
            param('email')
                .isEmail()
                .withMessage('Email must be valid'),
        ],
        validateRequest,
        verifyToken.verifyToken,
        (req: Request, res: Response, next: NextFunction) => ctrl.deleteUser(req, res, next));


    console.log('User route loaded');
}