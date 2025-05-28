import { inject, injectable } from "inversify";
import { IEventHandler } from "./contracts/event-handler.contract";
import IEmailClient from "../services/contracts/email-client";
import { TYPES } from "../dependency-injection/types";
import UserCodesDto from "../domain/dto/user-codes-dto";
import fs from 'fs';
import path from 'path';

@injectable()
export class CreateUserSendEmailHandler implements IEventHandler {
    private readonly emailClient: IEmailClient;
    constructor(
        @inject(TYPES.IEmailClient) emailClient: IEmailClient
    ) {
        this.emailClient = emailClient;
    }

    async handle(user: UserCodesDto) {

        let html = null;
        if (process.env.EMAIL_HTML) {
            try {
                html = fs.readFileSync(path.join(__dirname, `../../html/${process.env.EMAIL_HTML}.html`), 'utf8');
                const activationLink = this.generateActivationUrl(user);
                html = html.replace('<a id="activation-link">', `<a id="activation-link" href="${activationLink}">`);
            } catch (error) {
                console.log('Error reading HTML file:', error);
            }
        }

        await this.emailClient.sendEmail(
            user.email,
            process.env.EMAIL_SUBJECT || 'Welcome to the platform',
            'Activation link: ' + this.generateActivationUrl(user),
            html
        );
    }

    private generateActivationUrl(user: UserCodesDto): string {
        return `${process.env.CREATE_ACCOUNT_URL}/api/user/activate/${user.email}/${user.activationCode}`;
    }
}