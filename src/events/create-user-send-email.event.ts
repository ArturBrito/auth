import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";
import UserCodesDto from "../domain/dto/user-codes-dto";

@injectable()
export class CreateUserSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ){
        this.emailClient = emailClient;
    }

    async handle(user: UserCodesDto) {
        await this.emailClient.sendEmail(
            user.email,
            'Welcome to the platform',
            'Activation link: ' + this.generateActivationUrl(user)
        );
    }

    private generateActivationUrl(user: UserCodesDto): string {
        return `http://localhost:3000/api/user/activate/${user.email}/${user.activationCode}`;
    }
}