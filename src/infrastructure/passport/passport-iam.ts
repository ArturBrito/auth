import { injectable } from "inversify";
import IAuthIAMService from "../../services/contracts/iam-service-contract";
import passport from "passport";
import { UserNotFoundError } from "../../errors/user-not-found-error";

@injectable()
export default class PassportIAM implements IAuthIAMService {
    login(provider: string, scope: string[]) {
        return passport.authenticate(provider, { scope });
    }

    callback(provider: string) {
        return (req: any, res: any, next: any) => {
            passport.authenticate(provider, { session: false }, (err: Error | null, user: { tokens: string } | false) => {
                if (err) {
                    throw new Error(err?.message || 'Authentication failed');
                }
                if (!user) {
                    throw new UserNotFoundError();
                }
                res.status(200).json(user.tokens);
            })(req, res, next);
        }
    }
}