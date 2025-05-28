export interface IUserResetPasswordPersistence {
    email: string;
    resetCode?: string;
    createdAt?: Date;
}