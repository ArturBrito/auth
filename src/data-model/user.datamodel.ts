export interface IUserPersistence {
    uid: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    isActive: boolean;
    activationCode?: string;
    googleId?: string;
    //resetCode?: string;
}