import { Schema, model, models, Model } from "mongoose";
import { TUser, roles, languages } from "./userType";

const UserDataSchema = new Schema<TUser>(
    {
        email: { type: String, required: true, index: true, unique: true },
        role: { type: String, enum: [...roles], required: true },
        timestampcreatedAt: { type: Number, required: true },

        profile: {
            pseudo: { type: String },
            firstName: { type: String },
            lastName: { type: String },
            fullName: { type: String },
            phoneNumber: { type: String },
            telegramUsername: { type: String },
            telegramUserId: { type: String },
            avatarUrl: { type: String },
            address: {
                street: { type: String },
                city: { type: String },
                state: { type: String },
                postalCode: { type: String },
                country: { type: String },
            },
        },

        settings: {
            language: { type: String, enum: [...languages], required: true },
            marketing: {
                email: { type: Boolean, default: false },
                telegram: { type: Boolean, default: false },
                sms: { type: Boolean, default: false },
            },
        },

        affiliate: {
            code: { type: String },
            stripeAccountId: { type: String },
            notifyByEmail: { type: Boolean },
            notifyByTelegram: { type: Boolean },
        },

        subscription: {
            planId: { type: String },
            status: { type: String },
            referral: { type: String },
        },

        stripeCustomerId: { type: String },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export const UserData: Model<TUser> = models.userData || model<TUser>("userData", UserDataSchema);
