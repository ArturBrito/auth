export default interface UserCodesDto {
    email: string;
    activationCode?: string;
    resetCode?: string;
}