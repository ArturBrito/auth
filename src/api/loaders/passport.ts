import { Application } from 'express';
import '../../infrastructure/passport/passport-config';
import passport from 'passport';

export default ({ app }: { app: Application }) => {
    app.use(passport.initialize());
}