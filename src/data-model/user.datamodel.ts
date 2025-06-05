export interface IUserPersistence {
    uid: string;
    email: string;
    password: string;
    createdAt: Date;
    isActive: boolean;
    googleId?: string;
}