export interface UserDto {
    uid?: string;
    email: string;
    password?: string;
    createdAt?: Date;
    isActive?: boolean;
}