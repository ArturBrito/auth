import { injectable } from "inversify";
import * as nodemailer from 'nodemailer';
import IEmailClient from "../../services/contracts/email-client";
import { Options } from "nodemailer/lib/mailer";

@injectable()
export default class NodeMailerClient implements IEmailClient {
    private transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        requireTLS: true,
        secure: false,
        tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    async sendEmail(email: string, subject: string, message?: string, html?: string): Promise<void> {
        let mailOptions: Options;
        if (html) {
            mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject,
                html: html
            }
        } else {
            mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject,
                text: message
            }
        }


        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Email sent to:', email)
        } catch (error) {
            console.log(error)
        }
    }

}