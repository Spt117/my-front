export const marketPlaceEnum = ["amazon_fr", "amazon_de", "amazon_com"] as const;
export type TMarketPlace = (typeof marketPlaceEnum)[number];

export interface TAsin {
    asin: string;
    marketPlace: TMarketPlace;
    active: boolean;
    title?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
