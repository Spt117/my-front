const rotationDirections = ["right", "left", "both"] as const;
type TRotationDirection = (typeof rotationDirections)[number];
const beybladeTypes = ["stamina", "attack", "defense", "balance"] as const;
type TBeybladeType = (typeof beybladeTypes)[number];
const beybladeGenerations = ["Burst", "Metal", "X"] as const;
type TBeybladeGeneration = (typeof beybladeGenerations)[number];
const beybladeBrands = ["Hasbro", "Takara Tomy"] as const;
type TBeybladeBrand = (typeof beybladeBrands)[number];
const beybladePacks = [
    "Starter",
    "Booster",
    "Triple Booster",
    "Customize Set",
    "Deck Set",
    "Random Booster",
    "Launcher",
    "Battle Set",
    "Stadium",
    "Accessory",
] as const;
type TBeybladeProductType = (typeof beybladePacks)[number];
const launcherTypes = ["string", "ripcord"] as const;
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
    gimmick?: string;
    images: string[];
}
// Beyblade - Launcher - Arena //
// Beyblade - Launcher - Arena //

// Beyblade X //
// Beyblade X //
interface IBeybladeX {
    blade: string | IBlade;
    ratchet: string;
    bit: string;
}
interface IBlade {
    "lock chip": string;
    "main blade": string;
    "assist blade": string;
}
// Beyblade X //
// Beyblade X //

interface IBeybladeProduct {
    product: TBeybladeProductType;
    title: string;
    productCode: string;
    generation: TBeybladeGeneration;
    brand: TBeybladeBrand;
    images: string[];
    releaseDate: Date;
    asinEurope?: string;
    asinAmerica?: string;
    asinJapan?: string;
    content: (IBeyblade | ILauncher | IArena)[];
}
export type {
    TBeybladeGeneration,
    TBeybladeType,
    IBeyblade,
    IBeybladeProduct,
    TBeybladeProductType,
    IBeybladeX,
    IBlade,
    ILauncher,
    IArena,
};
