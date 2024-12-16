import expressLoader from './express';
import passportLoader from './passport';

export default async ({ expressApp }) => {

    expressLoader({ app: expressApp });
    passportLoader({ app: expressApp });

}