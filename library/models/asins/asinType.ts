export const marketPlaceEnum = ["amazon_fr", "amazon_de", "amazon_com"] as const;
export type TMarketPlace = (typeof marketPlaceEnum)[number];

export type TALerteMarketPlace = {
    active: boolean;
    marketPlace: TMarketPlace;
};

type TAsinMarketPlaces = {
    [key in TMarketPlace]?: boolean; // Champs dynamiques pour chaque marketplace
};
interface TAsinBase {
    asin: string;
    title?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TAsin = TAsinBase & TAsinMarketPlaces;
