export const marketPlaceEnum = ["amazon.fr", "amazon.de", "amazon.com"] as const;
export type TMarketPlace = (typeof marketPlaceEnum)[number];

type TALerteMarketPlace = {
    endOfAlerte: boolean;
    marketPlace: TMarketPlace;
};

export type TAsin = {
    asin: string;
    title?: string;
    alerte: TALerteMarketPlace[];
    createdAt?: Date;
    updatedAt?: Date;
};
