import { Application, NextFunction } from "express";
import { json } from 'body-parser';
import routes from "../routes";
import cors from 'cors';
import { errorHandler } from "../middlewares/error-handler";
import { NotFoundError } from "../../errors/not-found-error";
import 'express-async-errors';


export default ({ app }: { app: Application }) => {
    // health check
    app.get('/status', (req, res) => {
        res.status(200).end();
    });

    app.set('trust proxy', true);
    app.use(cors());
    app.use(json());

    app.use('/api', routes());

    app.all('*', async (req, res) => {
        throw new NotFoundError();
    });

    app.use(errorHandler);

};