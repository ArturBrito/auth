export interface UserDto {
    uid?: string;
    email: string;
    password?: string;
    role?: string;
    createdAt?: Date;
    isActive?: boolean;
    activationCode?: string;
}