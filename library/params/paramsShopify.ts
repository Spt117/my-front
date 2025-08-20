const languesTraductions = ["français", "anglais", "espagnol", "allemand"] as const;
export type TLangueTraduction = (typeof languesTraductions)[number];
export const boutiques = [
    {
        vendor: "Cartes Pokémon",
        domain: "toupies-beyblade.myshopify.com",
        langue: "français",
        flag: "/flags/fr.png",
    },
    {
        vendor: "Beyblade Shop",
        domain: "bayblade-shops.myshopify.com",
        langue: "français",
        flag: "/flags/fr.png",
    },
    {
        vendor: "Beyblade Shop",
        domain: "beyblade-shopde.myshopify.com",
        langue: "allemand",
        flag: "/flags/de.png",
    },
    {
        vendor: "Beyblade Toys",
        domain: "beyblade-toyss.myshopify.com",
        langue: "anglais",
        flag: "/flags/us.png",
    },
] as const satisfies readonly IShopify[];

export type Boutiques = typeof boutiques;
export type TDomainsShopify = Boutiques[number]["domain"];
export type TVendorsShopify = Boutiques[number]["vendor"];
export const domainsBeyblade = boutiques.filter((b) => b.vendor.includes("Beyblade")).map((b) => b.domain as TDomainsShopify);

export interface IShopify {
    vendor: string;
    domain: string;
    langue: TLangueTraduction;
    flag: string;
}

// Union de toutes les boutiques
// Clés lisibles côté code : on choisit le domaine comme clé stricte
// Récupérer le type d'une boutique à partir de son domaine (utile pour typer finement)
// export type ShopByDomain<D extends TDomainsShopify> = Extract<Boutiques[number], { domain: D }>;

export const apiVersion = "2024-01";
