import { Application } from 'express';
import passport from 'passport';

export default ({ app }: { app: Application }) => {
    if (process.env.GOOGLE_CLIENT_ID) {
        import('../../infrastructure/passport/passport-config').then(() => {
            app.use(passport.initialize());
        })
    }
}