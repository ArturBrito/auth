import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";
import { UserDto } from "../domain/dto/user-dto";
import fs from 'fs';
import path from 'path';

@injectable()
export class ChangePasswordSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ) {
        this.emailClient = emailClient;
    }
    async handle(payload: UserDto) {
        let html = null;
        if (process.env.EMAIL_CHANGED_PASSWORD_HTML) {
            try {
                html = fs.readFileSync(path.join(__dirname, `../../html/${process.env.EMAIL_CHANGED_PASSWORD_HTML}.html`), 'utf8');
            } catch (error) {
                console.log('Error reading HTML file:', error);
            }
        }

        await this.emailClient.sendEmail(
            payload.email,
            process.env.EMAIL_CHANGED_PASSWORD_SUBJECT || 'Password changed',
            'Your password has been changed successfully',
            html
        );
    }
}