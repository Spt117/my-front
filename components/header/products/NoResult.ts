import { ProductGET } from "@/library/types/graph";

export const productNoSearch: ProductGET = {
    id: "gid://shopify/Product/no-id",
    title: "Aucun produit trouvé",
    handle: "no-handle",
    description: "Aucun produit ne correspond à votre recherche.",
    descriptionHtml: "<p>Aucun produit ne correspond à votre recherche.</p>",
    vendor: "Cartes Pokémon",
    productType: "N/A",
    tags: [],
    collections: { edges: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "DRAFT",
    options: [],
    media: { nodes: [] },
    metafields: { nodes: [] },
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
                inventoryItem: { id: "gid://shopify/InventoryItem/no-item", tracked: false, requiresShipping: false },
                title: "N/A",
                price: "0.00",
                compareAtPrice: null,
                sku: "N/A",
                inventoryQuantity: 0,
                inventoryPolicy: "CONTINUE",
                selectedOptions: [],
            },
        ],
    },
    resourcePublicationsV2: { nodes: [] },
};
