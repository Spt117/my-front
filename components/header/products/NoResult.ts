import { ProductGET } from "@/library/types/graph";

export const productNoSearch: ProductGET = {
    id: "gid://shopify/Product/no-id",
    title: "Aucun produit trouvé",
    handle: "no-handle",
    description: "Aucun produit ne correspond à votre recherche.",
    vendor: "Cartes Pokémon",
    productType: "N/A",
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "DRAFT",
    images: {
        nodes: [
            {
                id: "gid://shopify/ProductImage/no-image",
                url: "/no_image.png",
                altText: "No image available",
            },
        ],
    },
    variants: {
        nodes: [
            {
                id: "gid://shopify/ProductVariant/no-variant",
                barcode: null,
                inventoryItem: [{ id?: GID;
    tracked: boolean;
    requiresShipping: boolean;}],
                title: "N/A",
                price: "0.00",
                compareAtPrice: null,
                sku: "N/A",
                inventoryQuantity: 0,
            },
        ],
    },
};
