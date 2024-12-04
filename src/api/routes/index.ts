import { Router } from "express";
import userRoute from "./user-route";

export default () => {
    const app = Router();

    userRoute(app);

    return app;
}