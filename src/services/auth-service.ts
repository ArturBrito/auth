import { inject, injectable } from "inversify";
import { AuthDto } from "../domain/dto/auth-dto";
import IUserRepository from "../domain/repositories/user-repository";
import IAuthService from "./contracts/auth-service-contract";
import IEncrypter from "./contracts/encrypter-contract";
import { TYPES } from "../dependency-injection/types";
import { InactiveUserError } from "../errors/inactive-user-error";
import IPasswordManager from "./contracts/password-manager";
import { BadRequestError } from "../errors/bad-request-error";
import IRefreshTokensStore from "./contracts/refresh-tokens-store";

@injectable()
export default class AuthService implements IAuthService {
    private userRepository: IUserRepository;
    private encrypter: IEncrypter;
    private passwordManager: IPasswordManager;
    private refreshTokenStore: IRefreshTokensStore;

    constructor(
        @inject(TYPES.IUserRepository) userRepository: IUserRepository,
        @inject(TYPES.IEncrypter) encrypter: IEncrypter,
        @inject(TYPES.IPasswordManager) passwordManager: IPasswordManager,
        @inject(TYPES.IRefreshTokensStore) refreshTokenStore: IRefreshTokensStore
    ) {
        this.userRepository = userRepository;
        this.encrypter = encrypter;
        this.passwordManager = passwordManager;
        this.refreshTokenStore = refreshTokenStore;
    }

    async signIn(email: string, password: string): Promise<AuthDto> {
        
        const user = await this.userRepository.getUserByEmail(email);
        
        if (!user) {
            throw new BadRequestError('Invalid credentials');
        }

        if(user.isActive === false) {
            throw new InactiveUserError();
        }

        const isPasswordValid = await this.passwordManager.comparePasswords(password, user.password);
        if(!isPasswordValid) {
            throw new BadRequestError('Invalid credentials');
        }

        const tokens = await this.encrypter.encrypt({ 
            uid: user.uid,
            email: user.email, 
            role: user.role 
        });

        await this.refreshTokenStore.saveRefreshToken(tokens.refreshToken);

        return tokens;
    }

    async refreshToken(refreshToken: string): Promise<AuthDto> {
        const token = await this.refreshTokenStore.getRefreshToken(refreshToken);

        if(!token) {
            throw new BadRequestError('Invalid refresh token');
        }

        const payload = await this.encrypter.decrypt(refreshToken);

        const tokens = await this.encrypter.encrypt(payload);

        await this.refreshTokenStore.deleteRefreshToken(refreshToken);
        await this.refreshTokenStore.saveRefreshToken(tokens.refreshToken);

        return tokens;
    }

    async signOut(refreshToken: string): Promise<void> {
        await this.refreshTokenStore.deleteRefreshToken(refreshToken);
    }
}