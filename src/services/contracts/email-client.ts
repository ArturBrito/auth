export default interface IEmailClient {
    sendEmail(email: string, subject: string, message?: string, html?: string): Promise<void>;
}