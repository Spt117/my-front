export interface IAmazonParams {
    key: string;
    marketplace: string;
    host: string;
    region: string;
    partnerTag: string;
}

export const amazonMarketPlaces = [
    {
        key: "amazon_fr",
        marketplace: "www.amazon.fr",
        host: "webservices.amazon.fr",
        region: "eu-west-1",
        partnerTag: "beybladepartn-21",
    },
    {
        key: "amazon_com",
        marketplace: "www.amazon.com",
        host: "webservices.amazon.com",
        region: "us-east-1",
        partnerTag: "beybladeshop-20",
    },
    {
        key: "amazon_de",
        marketplace: "www.amazon.de",
        host: "webservices.amazon.de",
        region: "eu-west-1",
        partnerTag: "beybladesho04-21",
    },
    {
        key: "amazon_co_jp",
        marketplace: "www.amazon.co.jp",
        host: "webservices.amazon.co.jp",
        region: "ap-northeast-1",
        partnerTag: "beybladeshopj-22",
    },
] as const satisfies readonly IAmazonParams[];

type TMarketPlace = typeof amazonMarketPlaces;

export type TDomainMarketplace = TMarketPlace[number]["marketplace"];
type THostMarketplace = TMarketPlace[number]["host"];
type TRegionMarketplace = TMarketPlace[number]["region"];
type TPartnerTagMarketplace = TMarketPlace[number]["partnerTag"];
type TKeyMarketplace = TMarketPlace[number]["key"];
export type AmazonMarketPlaces = typeof amazonMarketPlaces;
export type keyAmazonMarketPlaces = AmazonMarketPlaces[number]["key"];
export const getMarketplace = (key: keyAmazonMarketPlaces): IAmazonParams => {
    return amazonMarketPlaces.find((mp) => mp.key === key) as IAmazonParams;
};

export interface IMarketplace {
    key: TKeyMarketplace;
    domain: TDomainMarketplace;
    host: THostMarketplace;
    region: TRegionMarketplace;
    partnerTag: TPartnerTagMarketplace;
    currency: string;
}
