import { ProductStatus } from '@/library/types/graph';

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
    description: string | null;
}

interface ProductsCount {
    count: number;
}

export interface CollectionProduct {
    id: string;
    title: string;
    status: ProductStatus;
    featuredImage: {
        url: string;
        altText?: string;
    } | null;
    handle: string;
    variants: {
        nodes: {
            sku: string;
            price: string;
            inventoryQuantity: number;
        }[];
    };
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
    resourcePublicationsV2: {
        nodes: {
            isPublished: boolean;
            publishDate: string;
            publication: {
                id: string;
                supportsFuturePublishing: boolean;
                catalog: null | {
                    title: string;
                };
            };
        }[];
    };
}

export interface ShopifyCollectionWithProducts extends ShopifyCollection {
    products: CollectionProduct[];
}
