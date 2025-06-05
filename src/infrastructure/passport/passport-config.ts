import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { myContainer } from '../../dependency-injection/inversify.config';
import ITokenManager from '../../services/contracts/token-manager-contract';
import { TYPES } from '../../dependency-injection/types';
import IUserRepository from '../../domain/repositories/user-repository';
import { User } from '../../domain/entities/user';
import UserMapper from '../../domain/mapper/user-mapper';

const tokenManager = myContainer.get<ITokenManager>(TYPES.ITokenManager);
const userRepository = myContainer.get<IUserRepository>(TYPES.IUserRepository);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
      try {
        // Find or create the user in the database
        let user = await userRepository.getUserByEmail(profile.emails?.[0].value);

        if (!user) {
          user = User.create({
            googleId: profile.id,
            email: profile.emails?.[0].value
          });
          
          await userRepository.createUser(user);
        }else{
          user.setGoogleId(profile.id);
          await userRepository.updateUser(user);
        }

        const tokens = await tokenManager.sign({
          uid: user.uid,
          email: user.email,
          isActive: false
        })

        const userDto = UserMapper.toDto(user);

        return done(null, { userDto, tokens });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);