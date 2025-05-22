import { Request, Response, NextFunction } from "express";
import IUserService from "../services/contracts/user-service-contract";
import IUserController from "./contracts/user-controller-contract";
import { UserDto } from "../domain/dto/user-dto";
import { inject, injectable } from "inversify";
import { TYPES } from "../dependency-injection/types";

@injectable()
export default class UserController implements IUserController {
    private userService: IUserService;
    constructor(
        @inject(TYPES.IUserService) userService: IUserService
    ) { 
        this.userService = userService;
    }
    async resendActivationCode(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.body.email;
            await this.userService.resendActivationCode(email);
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
    async resetPasswordRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.body.email;
            await this.userService.resetPasswordRequest(email);
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.body.email;
            const resetCode = req.body.resetCode;
            const newPassword = req.body.newPassword;
            await this.userService.resetPassword(email, resetCode, newPassword);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userEmail = req.currentUser.email;
            const password = req.body.password;
            const newPassword = req.body.newPassword;
            await this.userService.changePassword(userEmail, password, newPassword);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.currentUser;
            await this.userService.deleteUser(user);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
    async activateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const activationCode = req.params.activationCode;
            const userEmail = req.params.email;
            const activatedUser = await this.userService.activateUser(userEmail, activationCode);
            res.status(200).send('User activated successfully');
        } catch (error) {
            next(error);
        }
    }
    async getUserByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.params.email;
            const user = await this.userService.getUserByEmail(email);
            res.status(200).json(user);
        } catch (error) {
            //throw error;
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userDto = req.body as UserDto;
            const newUser = await this.userService.createUser(userDto);
            res.status(201).json(newUser);
        } catch (error) {
            next(error);
        }
    }
}