import { Router, Request, Response, NextFunction } from 'express';
import IUserController from '../../controllers/contracts/user-controller-contract';
import { myContainer } from '../../dependency-injection/inversify.config';
import { TYPES } from '../../dependency-injection/types';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';

const router = Router();

export default (app: Router) => {
    
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
    router.put('/activate/:email/:activationCode', (req, res, next) => ctrl.activateUser(req, res, next));


    console.log('User route loaded');
}