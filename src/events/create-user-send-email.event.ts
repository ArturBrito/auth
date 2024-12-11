import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import { User } from "../domain/entities/user";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";

@injectable()
export class CreateUserSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ){
        this.emailClient = emailClient;
    }

    async handle(user: User) {
        await this.emailClient.sendEmail(
            user.email,
            'Welcome to the platform',
            'Activation code: ' + user.activationCode
        );
    }
}