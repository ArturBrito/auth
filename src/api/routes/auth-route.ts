import { Router, Request, Response, NextFunction } from "express";
import IAuthController from "../../controllers/contracts/auth-controller-contract";
import { TYPES } from "../../dependency-injection/types";
import { myContainer } from "../../dependency-injection/inversify.config";
import { validateRequest } from "../middlewares/validate-request";
import { body } from "express-validator";
import passport from "passport";
import IAuthIAMService from "../../services/contracts/iam-service-contract";

const router = Router();

export default (app: Router) => {

    const ctrl = myContainer.get<IAuthController>(TYPES.IAuthController);
    const authIAMService = myContainer.get<IAuthIAMService>(TYPES.IAuthIAMService);

    app.use('', router);
    router.post('/signin',
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
        (req: Request, res: Response, next: NextFunction) => ctrl.signIn(req, res, next));
    router.post('/refreshtoken',
        [
            body('refreshToken')
                .trim()
                .notEmpty()
                .withMessage('You must supply a refresh token')
        ],
        validateRequest,
        (req: Request, res: Response, next: NextFunction) => ctrl.refreshToken(req, res, next));

    router.get(
        '/google',
        (req: Request, res: Response, next: NextFunction) => ctrl.googleSignIn(req, res, next));
    

    router.get(
        '/google/callback',
        (req: Request, res: Response, next: NextFunction) => ctrl.googleCallback(req, res, next));

    console.log('Auth route loaded');
}