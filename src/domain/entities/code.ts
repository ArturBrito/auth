export class Code {
    private readonly _code: string;
    private readonly _createdAt: Date;

    constructor(code: string, createdAt?: Date) {
        this._code = code;
        this._createdAt = createdAt || new Date();
    }

    get code(): string {
        return this._code;
    }

    get createdAt(): Date {
        return this._createdAt;
    }
    isExpired(): boolean {
        // Check if the code is expired based on expiration time of 1 hour
        const expirationTime = 60 * 60 * 1000; // 1 hour in milliseconds
        return new Date().getTime() - this._createdAt.getTime() > expirationTime;
    }
}
