export const marketPlaceEnum = ["amazon_fr", "amazon_de", "amazon_com"] as const;
export type TMarketPlace = (typeof marketPlaceEnum)[number];

export const typeOfProductEnum = ["carte_pokemon"] as const;
export type TTypeOfProduct = (typeof typeOfProductEnum)[number];

export interface TAsin {
    asin: string;
    marketPlace: TMarketPlace;
    typeOfProduct: TTypeOfProduct;
}
