export const roles = ["admin", "user"] as const;
export type Role = (typeof roles)[number];

export const langage = ["fr", "en"] as const;
export type Langage = (typeof langage)[number];

export type TParamUpdateUser = {
    user: string;
    prop: string;
    value: string | boolean | number;
};

export type TUser = {
    _id?: string;
    email: string;
    role: (typeof roles)[number];
    timestampcreatedAt: number;
    profile: IUserProfile;
    settings: IUserSettings;
};

export interface IUserProfile {
    fullName: string;
    firstName: string;
    lastName: string;
    pseudo?: string;
    phoneNumber?: string;
    telegramUsername?: string;
    telegramUserId?: number;
    avatarUrl?: string;
    adress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}

interface IUserSettings {
    language: Langage;
    marketing: {
        email: boolean;
        telegram: boolean;
        sms?: boolean;
    };
}
