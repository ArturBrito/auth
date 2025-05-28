import { v4 as uuid } from "uuid";
import { Guard } from "../../helpers/Guard";
import { InvalidUserError } from "../../errors/invalid-user-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { Code } from "./code";

interface UserProps {
    uid?: string;
    email: string;
    password?: string;
    role: string;
    createdAt?: Date;
    isActive?: boolean;
    activationCode?: Code;
    googleId?: string;
    resetCode?: Code;
}

export class User {
    private readonly _uid: string;
    private _email: string;
    private _password: string;
    private _role: Role;
    private _createdAt: Date;
    private _isActive: boolean;
    private _activationCode: Code;
    private _googleId: string;
    private _resetCode: Code;

    private constructor(props: UserProps) {
        this._uid = props.uid || uuid();
        this._email = props.email;
        this._password = props.password || '';
        this._role = props.role as Role || Role.USER;
        this._createdAt = props.createdAt || new Date();
        this._isActive = props.isActive || false;
        this._activationCode = props.activationCode || new Code(uuid());
        this._googleId = props.googleId || '';
        this._resetCode = props.resetCode || null;
    }

    get uid(): string {
        return this._uid;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    get role(): Role {
        return this._role;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get activationCode(): Code {
        return this._activationCode;
    }

    get googleId(): string {
        return this._googleId;
    }

    get resetCode(): Code {
        return this._resetCode;
    }

    public static isValidPassword(password: string, passwordRequirements: string): boolean {
        const regex = new RegExp(passwordRequirements);
        return regex.test(password);
    }

    private static isRegisteringWithGoogle(props: UserProps): boolean {
        return !!props.googleId === true;
    }

    // TODO: Change this approach. It allows to create a user without password validation
    public static create(props: UserProps): User {
        const guardedNullProps = [
            { argument: props.email, argumentName: 'Email' }
        ]

        if (!this.isRegisteringWithGoogle(props)) {
            guardedNullProps.push({ argument: props.password, argumentName: 'Password' })
        }

        const guardNullProps = Guard.againstNullOrUndefinedBulk(guardedNullProps);

        if (!guardNullProps.succeeded) {
            throw new InvalidUserError(guardNullProps.message);
        }

        const guardEmail = Guard.isEmail(props.email, 'Email');

        if (!guardEmail.succeeded) {
            throw new InvalidUserError(guardEmail.message);
        }

        return new User(props);
    }

    public activateUser(activationCode: string): void {
        if (this._activationCode.code === activationCode) {
            this._isActive = true;
            return;
        }

        throw new BadRequestError('Invalid activation code');
    }

    public setPassword(password: string): void {
        this._password = password;
    }

    public setGoogleId(googleId: string): void {
        this._googleId = googleId;
    }

    public generateResetCode(): void {
        this._resetCode = new Code(uuid());
    }

    public setResetCode(resetCode: Code): void {
        this._resetCode = resetCode;
    }

    public generateActivationCode(): void {
        this.setActivationCode(new Code(uuid()));
    }

    public setActivationCode(activationCode: Code): void {
        this._activationCode = activationCode;
    }

    public validateResetCode(resetCode: string): boolean {
        return this._resetCode.code === resetCode;
    }

    public clearResetCode(): void {
        this._resetCode = null;
    }

    public clearActivationCode(): void {
        this._activationCode = null;
    }

}


export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    MANAGER = 'manager'
}