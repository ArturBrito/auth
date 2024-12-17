import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";
import { UserDto } from "../domain/dto/user-dto";

@injectable()
export class ChangePasswordSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ){
        this.emailClient = emailClient;
    }
    async handle(payload: UserDto) {
        await this.emailClient.sendEmail(
            payload.email,
            'Password changed',
            'Your password has been changed successfully'
        );
    }
}