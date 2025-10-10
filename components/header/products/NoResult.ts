import { ProductNode } from "./shopifySearch";

export const productNoSearch: ProductNode = {
    id: "no_id",
    title: "Aucun produit trouvé",
    handle: "no-handle",
    description: "Aucun produit ne correspond à votre recherche.",
    vendor: "N/A",
    productType: "N/A",
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "DRAFT",
    images: {
        edges: [
            {
                node: {
                    id: "no_image",
                    url: "/no_image.png",
                    altText: "No image available",
                },
            },
        ],
    },
    variants: {
        edges: [
            {
                node: {
                    id: "no_variant",
                    title: "N/A",
                    price: "0.00",
                    compareAtPrice: null,
                    sku: "N/A",
                    inventoryQuantity: 0,
                },
            },
        ],
    },
};
