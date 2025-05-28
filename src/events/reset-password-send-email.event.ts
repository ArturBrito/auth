import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";
import UserCodesDto from "../domain/dto/user-codes-dto";
import fs from 'fs';
import path from 'path';

@injectable()
export class ResetPasswordSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ) {
        this.emailClient = emailClient;
    }
    async handle(payload: UserCodesDto) {
        let html = null;

        if (process.env.EMAIL_RESET_HTML) {
            try {
                html = fs.readFileSync(path.join(__dirname, `../../html/${process.env.EMAIL_RESET_HTML}.html`), 'utf8');
                const resetLink = this.generateResetUrl(payload);
                html = html.replace('<a id="action-link">', `<a id="action-link" href="${resetLink}">`);
            } catch (error) {
                console.log('Error reading HTML file:', error);
            }
        }

        await this.emailClient.sendEmail(
            payload.email,
            process.env.EMAIL_RESET_SUBJECT || 'Reset password',
            `To reset your password, please click on the following link: ${this.generateResetUrl(payload)}`,
            html
        );
    }

    private generateResetUrl(user: UserCodesDto): string {
        return `${process.env.RESET_PASSWORD_URL}/${user.email}/${user.resetCode}`;
    }
}