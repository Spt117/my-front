interface IPartialWordpress {
    domain: string;
    username: string;
    language: string;
    categorie: string;
}

export const sitesWordpress = [
    {
        domain: "beyblade-x.fr",
        username: "contact@e-com-jbc.fr",
        language: "français",
        categorie: "beyblade",
    },
    {
        domain: "takara-tomy-beyblade.com",
        username: "contact@e-com-jbc.fr",
        language: "anglais",
        categorie: "beyblade",
    },
    {
        domain: "beyblade-x.de",
        username: "contact@e-com-jbc.fr",
        language: "allemand",
        categorie: "beyblade",
    },
    {
        domain: "beyblade-x.net",
        username: "contact@e-com-jbc.fr",
        language: "anglais",
        categorie: "beyblade",
    },
] as const satisfies readonly IPartialWordpress[];

export type Sites = typeof sitesWordpress;
export type TLangueWordpress = Sites[number]["language"];
export type TCategorieWordpress = Sites[number]["categorie"];
export type TDomainWordpress = Sites[number]["domain"];

export interface IWordpress {
    domain: TDomainWordpress;
    username: string;
    language: TLangueWordpress;
    categorie: TCategorieWordpress;
}
