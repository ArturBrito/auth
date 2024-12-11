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
    async activateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const activationCode = req.params.activationCode;
            const userEmail = req.params.email;
            const activatedUser = await this.userService.activateUser(userEmail, activationCode);
            res.status(200).json(activatedUser);
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