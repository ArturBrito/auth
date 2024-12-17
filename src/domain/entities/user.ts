import { v4 as uuid } from "uuid";
import { Guard } from "../../helpers/Guard";
import { InvalidUserError } from "../../errors/invalid-user-error";
import { InvalidActivationCode } from "../../errors/invalid-activation-code-error";

interface UserProps {
    uid?: string;
    email: string;
    password?: string;
    role: string;
    createdAt?: Date;
    isActive?: boolean;
    activationCode?: string;
    googleId?: string;
    resetCode?: string;
}

export class User {
    private readonly _uid: string;
    private _email: string;
    private _password: string;
    private _role: Role;
    private _createdAt: Date;
    private _isActive: boolean;
    private _activationCode: string;
    private _googleId: string;
    private _resetCode: string;

    private constructor(props: UserProps) {
        this._uid = props.uid || uuid();
        this._email = props.email;
        this._password = props.password || '';
        this._role = props.role as Role || Role.USER;
        this._createdAt = props.createdAt || new Date();
        this._isActive = props.isActive || false;
        this._activationCode = props.activationCode || uuid();
        this._googleId = props.googleId || '';
        this._resetCode = props.resetCode || '';
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

    get activationCode(): string {
        return this._activationCode;
    }

    get googleId(): string {
        return this._googleId;
    }

    get resetCode(): string {
        return this._resetCode;
    }

    private static isRegisteringWithGoogle(props: UserProps): boolean {
        return !!props.googleId === true;
    }

    public static create(props: UserProps): User {
        const guardedNullProps = [
            { argument: props.email, argumentName: 'Email' }
        ]

        if (
            !this.isRegisteringWithGoogle(props)
        ) {
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
        if (this._activationCode === activationCode) {
            this._isActive = true;
            this._activationCode = 'activated';
            return;
        }

        throw new InvalidActivationCode();
    }

    public setPassword(password: string): void {
        this._password = password;
    }

    public setGoogleId(googleId: string): void {
        this._googleId = googleId;
    }

    public generateResetCode(): void {
        this._resetCode = uuid();
    }

    public validateResetCode(resetCode: string): boolean {
        return this._resetCode === resetCode;
    }
    
    public clearResetCode(): void {
        this._resetCode = '';
    }

}


export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    MANAGER = 'manager'
}