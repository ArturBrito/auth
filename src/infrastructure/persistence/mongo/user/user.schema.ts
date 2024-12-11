import mongoose from "mongoose";
import { IUserPersistence } from "../../../../data-model/user.datamodel";

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    createdAt: { type: Date, required: true },
    isActive: { type: Boolean, required: true },
    activationCode: { type: String, required: false }
});

export { UserSchema };
export default mongoose.model<IUserPersistence & mongoose.Document>("User", UserSchema);