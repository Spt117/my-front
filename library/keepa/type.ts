export interface KeepaResponse {
    processingTimeInMs: number;
    products: KeepaProduct[];
    refillIn: number;
    refillRate: number;
    timestamp: number;
    tokenFlowReduction: number;
    tokensConsumed: number;
    tokensLeft: number;
}

export interface KeepaProduct {
    asin: string;
    author: string | null;
    availabilityAmazon: number;
    binding: string;
    brand: string;
    buyBoxEligibleOfferCounts: number[] | null;
    buyBoxSellerIdHistory: string[] | null;
    categories: number[] | null;
    categoryTree: KeepaCategory[] | null;
    color: string | null;
    competitivePriceThreshold: number;
    coupon: number[] | null;
    csv: (number[] | null)[];
    description: string | null;
    domainId: number;
    eanList: string[] | null;
    ebayListingIds: string[] | null;
    edition: string | null;
    fbaFees: KeepaFbaFees | null;
    features: string[] | null;
    format: string | null;
    frequentlyBoughtTogether: string[] | null;
    g: number;
    hasReviews: boolean;
    images: KeepaImage[] | null;
    imagesCSV: string | null;
    includedComponents: string | null;
    isAdultProduct: boolean;
    isB2B: boolean;
    isEligibleForSuperSaverShipping: boolean;
    isEligibleForTradeIn: boolean;
    isHeatSensitive: boolean;
    isRedirectASIN: boolean;
    isSNS: boolean;
    itemHeight: number;
    itemLength: number;
    itemTypeKeyword: string | null;
    itemWeight: number;
    itemWidth: number;
    languages: string[][] | null;
    lastEbayUpdate: number;
    lastPriceChange: number;
    lastRatingUpdate: number;
    lastSoldUpdate: number;
    lastUpdate: number;
    launchpad: boolean;
    listedSince: number;
    liveOffersOrder: number[] | null;
    manufacturer: string | null;
    material: string | null;
    materials: string[] | null;
    model: string | null;
    monthlySoldHistory: number[] | null;
    newPriceIsMAP: boolean;
    numberOfItems: number;
    numberOfPages: number;
    offersSuccessful: boolean;
    packageHeight: number;
    packageLength: number;
    packageQuantity: number;
    packageWeight: number;
    packageWidth: number;
    parentAsin: string | null;
    partNumber: string | null;
    productGroup: string | null;
    productType: number;
    promotions: any[] | null;
    publicationDate: number;
    referralFeePercent: number;
    referralFeePercentage: number;
    releaseDate: number;
    rootCategory: number;
    salesRankDisplayGroup: string | null;
    salesRankReference: number;
    salesRankReferenceHistory: number[] | null;
    salesRanks: Record<string, number[]> | null;
    size: string | null;
    stats?: KeepaStats | null;
    suggestedLowerPrice: number;
    targetAudienceKeyword: string | null;
    title: string;
    trackingSince: number;
    type: string | null;
    unitCount: KeepaUnitCount | null;
    upcList: string[] | null;
    urlSlug: string;
    variationCSV: string | null;
    variations: any[] | null;
    websiteDisplayGroup: string | null;
    websiteDisplayGroupName: string | null;
}

export interface KeepaCategory {
    catId: number;
    name: string;
}

export interface KeepaFbaFees {
    lastUpdate: number;
    pickAndPackFee: number;
}

export interface KeepaImage {
    l: string;
    lH: number;
    lW: number;
    m: string;
    mH: number;
    mW: number;
    s: string;
    sH: number;
    sW: number;
}

export interface KeepaUnitCount {
    unitType: string;
    unitValue: number;
}

export interface KeepaStats {
    current: number[];
    avg: number[];
    avg30: number[];
    avg90: number[];
    avg180: number[];
    min: number[];
    max: number[];
    atIntervals?: any;
}
