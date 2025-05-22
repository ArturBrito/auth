import express from 'express';

export default async function startServer() {
    const app = express();

    await require('./loaders').default({ expressApp: app });

    try {
        app.listen(process.env.AUTH_PORT || 3000, () => {
            console.log('Server started on port ' + (process.env.AUTH_PORT || 3000));
        });
    } catch (error) {
        console.error('Error starting server:', error);

    }
}

