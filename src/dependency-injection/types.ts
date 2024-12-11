const TYPES = {
    IUserController: Symbol.for('IUserController'),
    IUserService: Symbol.for('IUserService'),
    IUserRepository: Symbol.for('IUserRepository'),
    IPasswordManager: Symbol.for('IPasswordManager'),
    IAuthController: Symbol.for('IAuthController'),
    IAuthService: Symbol.for('IAuthService'),
    IEncrypter: Symbol.for('IEncrypter'),
    IRefreshTokensStore: Symbol.for('IRefreshTokensStore'),
    EventEmmiter: Symbol.for('EventEmmiter'),
    CreateUserSendEmailHandler: Symbol.for('CreateUserSendEmailHandler'),
    IEmailClient: Symbol.for('IEmailClient'),
    IVerifyToken: Symbol.for('IVerifyToken'),
    ISetupDb: Symbol.for('ISetupDb'),
};

export { TYPES };