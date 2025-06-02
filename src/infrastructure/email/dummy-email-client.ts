import { injectable } from "inversify";
import IEmailClient from "../../services/contracts/email-client";
import logger from "../../helpers/logger";

@injectable()
export default class DummyEmailClient implements IEmailClient{
    async sendEmail(to: string, subject: string, body: string, html?: string): Promise<void> {
        logger.debug('Email sent to:', to)
        logger.debug('Subject:', subject)
        if (html) {
            logger.debug('HTML:', html)
        } else {
            logger.debug('Text:', body)
        }
    }
}