import { Router } from "express";
import IAuthController from "../../controllers/contracts/auth-controller-contract";
import { TYPES } from "../../dependency-injection/types";
import { myContainer } from "../../dependency-injection/inversify.config";

const router = Router();

export default (app: Router) => {
    
    const ctrl = myContainer.get<IAuthController>(TYPES.IAuthController);

    app.use('', router);
    router.post('/signin', (req, res, next) => ctrl.signIn(req, res, next));
    router.post('/refreshtoken', (req, res, next) => ctrl.refreshToken(req, res, next));

    console.log('Auth route loaded');
}