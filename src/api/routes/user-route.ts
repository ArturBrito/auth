import { Router } from 'express';
import IUserController from '../../controllers/contracts/user-controller-contract';
import { myContainer } from '../../dependency-injection/inversify.config';
import { TYPES } from '../../dependency-injection/types';

const router = Router()

export default (app: Router) => {
    console.log('User route loaded');
    const ctrl = myContainer.get<IUserController>(TYPES.IUserController);

    app.use('/user', router);

    router.post('', (req, res, next) => ctrl.createUser(req, res, next));
    router.get('/:email', (req, res, next) => ctrl.getUserByEmail(req, res, next));
}