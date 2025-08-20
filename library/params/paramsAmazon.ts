const amazonKeys = {
    amazon_fr: {},
    amazon_com: {},
    amazon_de: {},
    amazon_co_jp: {},
} as const;
export type AmazonKey = keyof typeof amazonKeys;
export interface IAmazonParams {
    key: AmazonKey;
    marketplace: string;
    host: string;
    region: string;
    partnerTag: string;
}

export const amazonMarketPlaces = [
    { key: "amazon_fr", marketplace: "www.amazon.fr", host: "webservices.amazon.fr", region: "eu-west-1", partnerTag: "beybladepartn-21" },
    { key: "amazon_com", marketplace: "www.amazon.com", host: "webservices.amazon.com", region: "us-east-1", partnerTag: "beybladeshop-20" },
    { key: "amazon_de", marketplace: "www.amazon.de", host: "webservices.amazon.de", region: "eu-west-1", partnerTag: "beybladesho04-21" },
    { key: "amazon_co_jp", marketplace: "www.amazon.co.jp", host: "webservices.amazon.co.jp", region: "ap-northeast-1", partnerTag: "beybladeshopj-22" },
] as const satisfies readonly IAmazonParams[];

export type AmazonMarketPlaces = typeof amazonMarketPlaces;
export type keyAmazonMarketPlaces = AmazonMarketPlaces[number]["key"];
export const getMarketplace = (key: keyAmazonMarketPlaces): IAmazonParams => {
    return amazonMarketPlaces.find((mp) => mp.key === key) as IAmazonParams;
};
