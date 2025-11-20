export const rotationDirections = ["right", "left", "both"] as const;
type TRotationDirection = (typeof rotationDirections)[number];
export const beybladeTypes = ["stamina", "attack", "defense", "balance"] as const;
type TBeybladeType = (typeof beybladeTypes)[number];
export const beybladeGenerations = ["X", "Burst", "Metal"] as const;
type TBeybladeGeneration = (typeof beybladeGenerations)[number];
export const beybladeSystem = {
    X: ["Basic Line", "Unique Line", "Custom Line"] as const,
    Burst: ["Standard", "SwitchStrike", "Hypersphere", "Speedstorm"] as const,
    Metal: ["Fusion", "Fury", "Masters"] as const,
};
export type SystemForGeneration<G extends TBeybladeGeneration> = (typeof beybladeSystem)[G][number];
export const beybladeBrands = ["Hasbro", "Takara Tomy"] as const;
type TBeybladeBrand = (typeof beybladeBrands)[number];
export const beybladePacks = ["Starter", "Booster", "Triple Booster", "Customize Set", "Deck Set", "Random Booster", "Launcher", "Battle Set", "Entry Set", "Stadium", "Accessory"] as const;
type TBeybladeProductType = (typeof beybladePacks)[number];
export const launcherTypes = ["string", "ripcord"] as const;
export const nameLaunchers = ["Entry Launcher", "Winder Launcher", "String Launcher"] as const;
export type TLauncherName = (typeof nameLaunchers)[number];
type TLauncherType = (typeof launcherTypes)[number];

// Beyblade - Launcher - Arena //
// Beyblade - Launcher - Arena //
interface IBeyblade {
    productCode: string;
    name: string;
    rotationDirection: TRotationDirection;
    type: TBeybladeType;
    system: string;
    weight?: number;
    owner?: string;
    parts: IBeybladeX;
    images: string[];
}
interface ILauncher {
    productCode: string;
    type: TLauncherType;
    system: string;
    color: string;
    rotationDirection: TRotationDirection;
    images: string[];
}
interface IArena {
    productCode: string;
    color: string;
    system: string;
    diameter?: number;
    xlineColor?: string;
    gimmick?: string;
    images: string[];
}
// Beyblade - Launcher - Arena //
// Beyblade - Launcher - Arena //

// Beyblade X //
// Beyblade X //
interface IBeybladeX {
    "lock chip"?: string;
    "main blade"?: string;
    "assist blade"?: string;
    blade?: string;
    ratchet: string;
    bit: string;
}

// Beyblade X //
// Beyblade X //

// Accessory //
// Accessory //
interface IAccessory {
    _id?: string;
    productCode: string;
    generation: TBeybladeGeneration;
    name: string;
    type: "tool" | "sticker" | "case" | "launcher grip" | "other";
    system: string;
    images: string[];
}
// Accessory //
// Accessory //

export const typeBeybladeProductContent = ["beyblade", "launcher", "arena", "accessory"] as const;
export type TBeybladeProductTypeContent = (typeof typeBeybladeProductContent)[number];
interface IProductContentItem {
    type: TBeybladeProductTypeContent;
    name: string;
    notes?: string; // "Special color", "Tournament edition", etc.
    toReview: boolean; // Flag to indicate if the item needs review
}
interface IBeybladeProduct {
    _id?: string;
    generation?: TBeybladeGeneration;
    product: TBeybladeProductType | null;
    brand: TBeybladeBrand;
    productCode: string;
    title: string;
    system: SystemForGeneration<TBeybladeGeneration>;
    images: string[];
    releaseDate?: Date;
    asinEurope?: string;
    asinAmerica?: string;
    asinJapan?: string;
    content: number;
}
export type { IAccessory, IArena, IBeyblade, IBeybladeProduct, IBeybladeX, ILauncher, IProductContentItem, TBeybladeGeneration, TBeybladeProductType, TBeybladeType };
