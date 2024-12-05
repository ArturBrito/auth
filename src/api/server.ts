import express from 'express';
import { errorHandler } from './middlewares/error-handler';

export default async function startServer() {
    const app = express();

    await require('./loaders').default({ expressApp: app });

    try {
        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    } catch (error) {
        console.error('Error starting server:', error);

    }
}

