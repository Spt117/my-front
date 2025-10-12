const languesTraductions = ["français", "anglais", "espagnol", "allemand"] as const;
export type TLangueTraduction = (typeof languesTraductions)[number];

// 1. Définir d'abord l'interface de base sans contrainte sur domain
export interface IShopifyBase {
    vendor: string;
    domain: string;
    publicDomain: string;
    locationHome: number;
    langue: TLangueTraduction;
    flag: string;
    devise: string;
    marketplaceAmazon: string;
}

// 2. Définir le tableau des boutiques avec l'interface de base
export const boutiques = [
    {
        vendor: "Cartes Pokémon",
        domain: "toupies-beyblade.myshopify.com",
        publicDomain: "cartes-pokemon.com",
        locationHome: 34463252529,
        langue: "français",
        flag: "/flags/fr.png",
        devise: "€",
        marketplaceAmazon: "amazon.fr",
    },
    {
        vendor: "Beyblade Shop",
        domain: "bayblade-shops.myshopify.com",
        publicDomain: "beyblade-shop.com",
        locationHome: 32727892040,
        langue: "français",
        flag: "/flags/fr.png",
        devise: "€",
        marketplaceAmazon: "amazon.fr",
    },
    {
        vendor: "Beyblade Shop",
        domain: "beyblade-shopde.myshopify.com",
        publicDomain: "beyblade-shop.de",
        locationHome: 63287656610,
        langue: "allemand",
        flag: "/flags/de.png",
        devise: "€",
        marketplaceAmazon: "amazon.de",
    },
    {
        vendor: "Beyblade Toys",
        domain: "beyblade-toyss.myshopify.com",
        publicDomain: "beyblade-toys.com",
        langue: "anglais",
        locationHome: 87601742141,
        flag: "/flags/us.png",
        devise: "$",
        marketplaceAmazon: "amazon.com",
    },
] as const satisfies readonly IShopifyBase[];

// 3. Dériver les types après la définition du tableau
export type TBoutiques = typeof boutiques;
export type TDomainsShopify = TBoutiques[number]["domain"];
export type TPublicDomainsShopify = TBoutiques[number]["publicDomain"];
export type TVendorsShopify = TBoutiques[number]["vendor"];
export type TLocationHome = TBoutiques[number]["locationHome"];
export type TMarketplaceAmazonBoutique = TBoutiques[number]["marketplaceAmazon"];

// 4. Maintenant définir l'interface finale avec le type strict pour domain
export interface IShopify {
    vendor: TVendorsShopify;
    domain: TDomainsShopify;
    locationHome: TLocationHome;
    langue: TLangueTraduction;
    publicDomain: TPublicDomainsShopify;
    marketplaceAmazon: TMarketplaceAmazonBoutique;
    flag: string;
    devise: string;
}

export const domainsBeyblade = boutiques.filter((b) => b.vendor.includes("Beyblade")).map((b) => b.domain);

export const boutiqueFromLocation = (locationHome: TLocationHome) => {
    const b = boutiques.find((b) => b.locationHome === Number(locationHome));
    if (!b) throw new Error(`Boutique non trouvée pour la locationHome: ${locationHome}`);
    return b;
};
export const boutiqueFromDomain: (domain: TDomainsShopify) => IShopify = (domain: TDomainsShopify) => {
    const b = boutiques.find((b) => b.domain === domain);
    if (!b) throw new Error(`Boutique non trouvée pour le domaine: ${domain}`);
    return b;
};
export const apiVersion = "2024-01";

const paramsDataShop = ["tags", "productTypes", "collections", "salesChannels"] as const;
export type TParamsDataShop = (typeof paramsDataShop)[number];
