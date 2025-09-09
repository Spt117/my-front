const languesTraductions = ["français", "anglais", "espagnol", "allemand"] as const;
export type TLangueTraduction = (typeof languesTraductions)[number];

// 1. Définir d'abord l'interface de base sans contrainte sur domain
export interface IShopifyBase {
    vendor: string;
    domain: string;
    locationHome: number;
    langue: TLangueTraduction;
    flag: string;
}

// 2. Définir le tableau des boutiques avec l'interface de base
export const boutiques = [
    {
        vendor: "Cartes Pokémon",
        domain: "toupies-beyblade.myshopify.com",
        locationHome: 34463252529,
        langue: "français",
        flag: "/flags/fr.png",
    },
    {
        vendor: "Beyblade Shop Fr",
        domain: "bayblade-shops.myshopify.com",
        locationHome: 32727892040,
        langue: "français",
        flag: "/flags/fr.png",
    },
    {
        vendor: "Beyblade Shop De",
        domain: "beyblade-shopde.myshopify.com",
        locationHome: 63287656610,
        langue: "allemand",
        flag: "/flags/de.png",
    },
    {
        vendor: "Beyblade Toys",
        domain: "beyblade-toyss.myshopify.com",
        langue: "anglais",
        locationHome: 87601742141,
        flag: "/flags/us.png",
    },
] as const satisfies readonly IShopifyBase[];

// 3. Dériver les types après la définition du tableau
export type TBoutiques = typeof boutiques;
export type TDomainsShopify = TBoutiques[number]["domain"];
export type TVendorsShopify = TBoutiques[number]["vendor"];
export type TLocationHome = TBoutiques[number]["locationHome"];

// 4. Maintenant définir l'interface finale avec le type strict pour domain
export interface IShopify {
    vendor: TVendorsShopify;
    domain: TDomainsShopify;
    locationHome: TLocationHome;
    langue: TLangueTraduction;
    flag: string;
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
