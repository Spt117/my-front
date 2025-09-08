"use server";
import { getServer } from "@/library/utils/fetchServer";
import { revalidatePath } from "next/cache";
import { ProductInOrder } from "./store";
import { ShopifyOrder } from "@/library/shopify/orders";

export async function getOrders(url: string) {
    const response = await getServer(url);
    if (!response || !response.response) return null;
    const data: ShopifyOrder[] = response.response;

    const products: ProductInOrder[] = data.flatMap((order) =>
        order.lineItems.edges.flatMap(({ node }) => {
            return {
                title: node.title,
                image: node?.variant?.product?.featuredImage?.url || " ",
                productUrl: `https://${order.shop}/admin/products/${node.variant?.product.id.split("/").pop()}`,
                quantity: node.quantity,
                shop: order.shop,
                sku: node.sku,
            };
        })
    );

    // Regroupement par SKU avec addition des quantités
    const groupedProducts: ProductInOrder[] = products.reduce((acc: ProductInOrder[], product) => {
        const existingProduct = acc.find((p) => p.sku === product.sku);

        if (existingProduct) {
            // Si le SKU existe déjà, on additionne la quantité
            existingProduct.quantity += product.quantity;
        } else {
            // Sinon on ajoute le produit à l'accumulateur
            acc.push({ ...product });
        }

        return acc;
    }, []);

    return { orders: data, products: groupedProducts };
}

export async function revalidateOrders() {
    revalidatePath("/orders");
    return true;
}
