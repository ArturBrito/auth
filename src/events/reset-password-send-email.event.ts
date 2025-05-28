import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";
import UserCodesDto from "../domain/dto/user-codes-dto";

@injectable()
export class ResetPasswordSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ) {
        this.emailClient = emailClient;
    }
    async handle(payload: UserCodesDto) {
        await this.emailClient.sendEmail(
            payload.email,
            'Reset password',
            `To reset your password, please click on the following link: ${this.generateResetUrl(payload)}`
        );
    }

    private generateResetUrl(user: UserCodesDto): string {
        return `${process.env.RESET_PASSWORD_URL}/${user.email}/${user.resetCode}`;
    }
}