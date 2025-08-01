import { Schema, model, models } from "mongoose";
import { TUser } from "./userType";

const UserDataSchema = new Schema<TUser>({
    email: { type: String, required: true, index: true },
    role: { type: String, required: true },
    timestampcreatedAt: { type: Number, required: true },
    profile: {
        pseudo: { type: String, required: false },
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        fullName: { type: String, required: false },
        phoneNumber: { type: String, required: false },
        telegramUsername: { type: String, required: false },
        telegramUserId: { type: Number, required: false },
        avatarUrl: { type: String, required: false },
        address: {
            street: { type: String, required: false },
            city: { type: String, required: false },
            state: { type: String, required: false },
            postalCode: { type: String, required: false },
            country: { type: String, required: false },
        },
    },
    settings: {
        language: { type: String, required: true },
        marketing: {
            email: { type: Boolean, required: false },
            sms: { type: Boolean, required: false },
            telegram: { type: Boolean, required: false },
        },
    },
});

export const UserData = models.userData || model("userData", UserDataSchema);
