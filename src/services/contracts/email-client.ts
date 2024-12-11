export default interface IEmailClient {
    sendEmail(email: string, subject: string, message: string): Promise<void>;
}