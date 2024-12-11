import { injectable } from "inversify";
import IEmailClient from "../../services/contracts/email-client";

@injectable()
export default class DummyEmailClient implements IEmailClient{
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        console.log('Email sent to:', to)
        console.log('Subject:', subject)
        console.log('Body:', body)
    }
}