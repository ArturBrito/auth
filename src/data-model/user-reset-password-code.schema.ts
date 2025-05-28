import mongoose from "mongoose";
import { IUserResetPasswordPersistence } from "./user-reset-password-code.datamodel";


const UserResetPasswordCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    resetCode: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

export { UserResetPasswordCodeSchema };
export default mongoose.model<IUserResetPasswordPersistence & mongoose.Document>("UserResetPasswordCode", UserResetPasswordCodeSchema);