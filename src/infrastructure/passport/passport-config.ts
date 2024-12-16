import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { myContainer } from '../../dependency-injection/inversify.config';
import IEncrypter from '../../services/contracts/encrypter-contract';
import { TYPES } from '../../dependency-injection/types';
import IUserRepository from '../../domain/repositories/user-repository';
import { Role, User } from '../../domain/entities/user';
import UserMapper from '../../domain/mapper/user-mapper';

const encrypter = myContainer.get<IEncrypter>(TYPES.IEncrypter);
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
        let user = await userRepository.getByGoogleId(profile.id);

        if (!user) {
          user = User.create({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            role: Role.USER
          });
          
          await userRepository.createUser(user);
        }

        const tokens = await encrypter.encrypt({
          uid: user.uid,
          email: user.email,
          role: user.role,
          isActive: true,
        })

        const userDto = UserMapper.toDto(user);

        return done(null, { userDto, tokens });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);