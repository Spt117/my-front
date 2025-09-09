import { TVendorsShopify } from "../params/paramsShopify";

type GID = `gid://shopify/${string}`;

type ProductStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";
type InventoryPolicy = "DENY" | "CONTINUE";

interface ProductOption {
    id?: GID;
    name: string;
    values: (string | { name: string })[];
}

interface MediaImageFile {
    url: string;
    width: number;
    height: number;
}

interface MediaImageNode {
    id: GID;
    alt: string;
    image: MediaImageFile;
}

interface Connection<T> {
    nodes: T[];
}

interface VariantSelectedOption {
    name: string;
    value: string;
}

interface InventoryItemRef {
    id?: GID;
    tracked: boolean;
    requiresShipping: boolean;
}

interface ProductVariantNodeGET {
    id: GID;
    title: string;
    sku: string;
    price: string;
    compareAtPrice: string | null;
    barcode: string | null;
    inventoryQuantity: number;
    inventoryPolicy: InventoryPolicy;
    inventoryItem: InventoryItemRef;
    selectedOptions: VariantSelectedOption[];
}

export interface CategoryProduct {
    id?: GID;
    name: string;
    fullName: string;
}

type MetafieldType = "single_line_text_field" | "string" | "list.product_reference" | "boolean" | (string & {});
const metafieldKeys = ["asin", "url_video", "id_video_youtube", "amazon_activate", "lien_amazon", "title_tag", "description_tag", "related_products", "complementary_products"] as const;
export type TMetafieldKeys = (typeof metafieldKeys)[number];
export interface TMetafield {
    id?: GID;
    namespace: string;
    key: TMetafieldKeys;
    type: MetafieldType;
    value: string;
}

export interface ProductGET {
    id: GID;
    handle: string;
    title: string;
    status: ProductStatus;
    vendor: TVendorsShopify;
    productType: string;
    category?: CategoryProduct;
    tags: string[];
    createdAt: string; // ISO
    updatedAt: string; // ISO
    descriptionHtml: string;
    options: ProductOption[];
    media: Connection<MediaImageNode>;
    variants: Connection<ProductVariantNodeGET>;
    metafields: Connection<TMetafield>;
}

export interface ProductPOST {
    handle: string;
    title: string;
    status: ProductStatus;
    vendor: TVendorsShopify;
    productType: string;
    category?: string;
    tags: string[];
    descriptionHtml: string;
    productOptions: ProductOption[];
    files: ShopifyFile[];
    variants: VariantPOST[];
    metafields: TMetafield[];
}
export interface VariantPOST {
    sku: string;
    barcode: string | null;
    price: string;
    compareAtPrice: string | null;
    optionValues: VariantOption[];
    inventoryPolicy: InventoryPolicy;
    inventoryItem: InventoryItemRef;
    inventoryQuantities: IInventoryQuantity[];
}
export interface IInventoryQuantity {
    locationId: GID;
    name: string;
    quantity: number;
}
export type ShopifyFile =
    // Image/vidéo distante (depuis une URL)
    | {
          originalSource: string; // URL publique absolue
          alt?: string;
          contentType: "IMAGE" | "VIDEO";
      }
    // Image/vidéo locale (depuis le disque, encodée en base64)
    | {
          attachment: string; // Contenu encodé en base64
          filename: string; // Nom du fichier avec extension
          alt?: string;
          contentType?: "IMAGE" | "VIDEO"; // Optionnel, déduit de l'extension si non fourni
      };
interface VariantOption {
    optionName: string;
    name: string;
}
