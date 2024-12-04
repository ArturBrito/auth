import { v4 as uuid } from "uuid";

interface UserProps {
    uid?: string;
    email: string;
    password: string;
    role: string;
    createdAt?: Date;
    isActive?: boolean;
}

export class User {
    private readonly _uid: string;
    private _email: string;
    private _password: string;
    private _role: Role;
    private _createdAt: Date;
    private _isActive: boolean;

    private constructor(props: UserProps) {
        this._uid = props.uid || uuid();
        this._email = props.email;
        this._password = props.password;
        this._role = props.role as Role || Role.USER;
        this._createdAt = props.createdAt || new Date();
        this._isActive = props.isActive || true;
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

    public static create(props: UserProps): User {
        return new User(props);
    }
   
}


export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    MANAGER = 'manager'
}