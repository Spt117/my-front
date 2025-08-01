/**
 * Liste des rôles utilisateur.
 */
export const roles = ["admin", "user"] as const;
/** Type des rôles utilisateur */
export type Role = (typeof roles)[number];

/**
 * Langues supportées.
 */
export const languages = ["fr", "en"] as const;
/** Type des langues */
export type Language = (typeof languages)[number];

/**
 * Paramètre générique pour une mise à jour utilisateur.
 */
export type TParamUpdateUser = {
    /** Email ou ID utilisateur */
    user: string;
    /** Propriété à mettre à jour (notation pointée possible) */
    prop: string;
    /** Nouvelle valeur */
    value: string | boolean | number;
};

/**
 * Interface utilisateur principale.
 */
export type TUser = {
    _id?: string;
    email: string;
    role: Role;
    timestampcreatedAt: number;
    profile: IUserProfile;
    settings: IUserSettings;
    affiliate?: {
        code?: string;
        stripeAccountId?: string;
        notifyByEmail?: boolean;
        notifyByTelegram?: boolean;
    };
    subscription?: {
        planId: string;
        status?: string;
        referral?: string;
    };
    stripeCustomerId?: string;
};

/**
 * Informations de profil utilisateur.
 */
export interface IUserProfile {
    fullName: string;
    firstName: string;
    lastName: string;
    pseudo?: string;
    phoneNumber?: string;
    telegramUsername?: string;
    telegramUserId?: string;
    avatarUrl?: string;
    address?: IUserAddress;
}

/**
 * Adresse postale.
 */
export interface IUserAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

/**
 * Préférences de l'utilisateur.
 */
export interface IUserSettings {
    language: Language;
    marketing: IUserMarketingPreferences;
}

/**
 * Préférences marketing.
 */
export interface IUserMarketingPreferences {
    email: boolean;
    telegram: boolean;
    sms?: boolean;
}
