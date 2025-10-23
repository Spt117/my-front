interface CollectionImage {
    src: string;
    altText?: string;
    width?: number;
    height?: number;
}

interface CollectionRule {
    column: string;
    relation: string;
    condition: string;
}

interface CollectionRuleSet {
    appliedDisjunctively: boolean;
    rules: CollectionRule[];
}

interface CollectionSEO {
    title: string;
    description: string;
}

interface ProductsCount {
    count: number;
}

export interface CollectionProduct {
    id: string;
    title: string;
    featuredImage: {
        url: string;
        altText?: string;
    } | null;
}

export interface ShopifyCollection {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    image: CollectionImage | null;
    updatedAt: string;
    productsCount: ProductsCount;
    sortOrder: string;
    templateSuffix: string;
    ruleSet: CollectionRuleSet;
    seo: CollectionSEO;
    events: { nodes: { createdAt: string; action: string }[] };
}

export interface ShopifyCollectionWithProducts extends ShopifyCollection {
    products: CollectionProduct[];
}
