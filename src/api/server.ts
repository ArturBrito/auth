import express from 'express';
import logger, { morganMiddleware } from '../helpers/logger';

export default async function startServer() {
    const app = express();
    app.use(morganMiddleware);

    await require('./loaders').default({ expressApp: app });

    try {
        app.listen(process.env.AUTH_PORT || 3000, () => {
            logger.info('Server started on port ' + (process.env.AUTH_PORT || 3000));
        });
    } catch (error) {
        logger.error('Error starting server:', error);

    }
}

