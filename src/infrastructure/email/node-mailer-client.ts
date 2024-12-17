import { injectable } from "inversify";
import * as nodemailer from 'nodemailer';
import IEmailClient from "../../services/contracts/email-client";

@injectable()
export default class NodeMailerClient implements IEmailClient {
    private transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    async sendEmail(email: string, subject: string, message: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message
        }

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent to:', email)
        } catch (error) {
            console.log(error)
        }
    }

}