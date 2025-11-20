export interface IAmazonParams {
    key: string;
    name: string;
    domain: string;
    host: string;
    region: string;
    partnerTag: string;
}

export const amazonMarketPlaces = [
    {
        key: "amazon_fr",
        domain: "www.amazon.fr",
        name: "Amazon.fr",
        host: "webservices.amazon.fr",
        region: "eu-west-1",
        partnerTag: "beybladepartn-21",
    },
    {
        key: "amazon_com",
        name: "Amazon.com",
        domain: "www.amazon.com",
        host: "webservices.amazon.com",
        region: "us-east-1",
        partnerTag: "beybladeshop-20",
    },
    {
        key: "amazon_de",
        name: "Amazon.de",
        domain: "www.amazon.de",
        host: "webservices.amazon.de",
        region: "eu-west-1",
        partnerTag: "beybladesho04-21",
    },
    {
        key: "amazon_co_jp",
        name: "Amazon.co.jp",
        domain: "www.amazon.co.jp",
        host: "webservices.amazon.co.jp",
        region: "ap-northeast-1",
        partnerTag: "beybladeshopj-22",
    },
] as const satisfies readonly IAmazonParams[];

type TMarketPlace = typeof amazonMarketPlaces;

export type TDomainMarketplace = TMarketPlace[number]["domain"];
type THostMarketplace = TMarketPlace[number]["host"];
type TRegionMarketplace = TMarketPlace[number]["region"];
type TPartnerTagMarketplace = TMarketPlace[number]["partnerTag"];
type TKeyMarketplace = TMarketPlace[number]["key"];
export type TNameMarketplace = TMarketPlace[number]["name"];
export type AmazonMarketPlaces = typeof amazonMarketPlaces;
export type keyAmazonMarketPlaces = AmazonMarketPlaces[number]["key"];
export const getMarketplace = (key: keyAmazonMarketPlaces): IAmazonParams => {
    return amazonMarketPlaces.find((mp) => mp.key === key) as IAmazonParams;
};

export interface IMarketplace {
    key: TKeyMarketplace;
    domain: TDomainMarketplace;
    host: THostMarketplace;
    name: TNameMarketplace;
    region: TRegionMarketplace;
    partnerTag: TPartnerTagMarketplace;
    currency: string;
}
