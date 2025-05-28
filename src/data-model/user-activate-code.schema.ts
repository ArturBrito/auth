import mongoose from "mongoose";
import { IUserActivateCodePersistence } from "./user-activate-code.datamodel";

const UserActivateCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    activateCode: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

export { UserActivateCodeSchema };
export default mongoose.model<IUserActivateCodePersistence & mongoose.Document>("UserActivateCode", UserActivateCodeSchema);