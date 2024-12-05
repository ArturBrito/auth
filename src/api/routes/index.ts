import { Router } from "express";
import userRoute from "./user-route";
import authRoute from "./auth-route";

export default () => {
    const app = Router();

    userRoute(app);
    authRoute(app);

    return app;
}