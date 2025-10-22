"use server";
import { GroupedShopifyOrder, IShopifyOrderResponse, ShopifyOrder } from "@/library/shopify/orders";
import { getServer, postServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { ProductInOrder } from "./store";

export async function getOrders() {
    const url = `${pokeUriServer}/shopify/orders`;
    const response = await getServer(url);
    if (!response || !response.response) return null;
    const data: ShopifyOrder[] = response.response;
    const filterOrdersProductsUnfulfilled = data.map((order) => ({
        ...order,
        lineItems: {
            edges: order.lineItems.edges.filter(({ node }) => node.fulfillmentStatus === "unfulfilled"),
        },
    }));

    const products: ProductInOrder[] = filterOrdersProductsUnfulfilled.flatMap((order) =>
        order.lineItems.edges.flatMap(({ node }) => {
            return {
                title: node.title,
                image: node?.variant?.product?.featuredImage?.url || " ",
                productUrl: `https://${order.shop}/admin/products/${node.variant?.product.id.split("/").pop()}`,
                quantity: node.quantity,
                fulfillmentStatus: node.fulfillmentStatus,
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

    return { orders: groupOrdersByCustomerEmail(filterOrdersProductsUnfulfilled), products: groupedProducts };
}

export async function searchOrders(domain: string, query: string) {
    const req = query.includes("@") ? "orders-customer" : "get-order";
    const uri = `http://localhost:9100/shopify/${req}`;
    const res = await postServer(uri, {
        domain,
        orderName: query.trim(),
    });
    return res.response as ShopifyOrder[];
}

export async function getOrderById(params: { orderId: string; domain: string }) {
    const url = `http://localhost:9100/shopify/get-order-by-id`;
    const res = (await postServer(url, params)) as IShopifyOrderResponse;
    const order = res.response;
    if (!order) return null;
    const groupedOrder = groupOrdersByCustomerEmail([order]);
    return groupedOrder[0];
}

function groupOrdersByCustomerEmail(orders: ShopifyOrder[]): GroupedShopifyOrder[] {
    const groupedOrders = new Map<string, GroupedShopifyOrder>();

    orders.forEach((order) => {
        const customerEmail = order.customer.email;

        if (groupedOrders.has(customerEmail)) {
            const existingOrder = groupedOrders.get(customerEmail)!;

            // Additionner les montants
            const existingAmount = parseFloat(existingOrder.totalPriceSet.shopMoney.amount);
            const currentAmount = parseFloat(order.totalPriceSet.shopMoney.amount);
            const totalAmount = (existingAmount + currentAmount).toFixed(2);

            // Ajouter le nom de la commande à l'array
            existingOrder.name.push(order.name);
            existingOrder.legacyResourceId.push(order.legacyResourceId);

            // Mettre à jour le montant total
            existingOrder.totalPriceSet.shopMoney.amount = totalAmount;

            // Fusionner les line items
            existingOrder.lineItems.edges.push(...order.lineItems.edges);

            // Garder la date de création la plus récente
            if (new Date(order.createdAt) > new Date(existingOrder.createdAt)) {
                existingOrder.createdAt = order.createdAt;
            }
        } else {
            // Créer une nouvelle entrée groupée
            const products = order.lineItems.edges;
            const groupedOrder: GroupedShopifyOrder = {
                ...order,
                name: [order.name], // Convertir en array
                lineItems: {
                    edges: [...products], // Copier les edges
                },
                legacyResourceId: [order.legacyResourceId], // Convertir en array
            };

            groupedOrders.set(customerEmail, groupedOrder);
        }
    });

    return Array.from(groupedOrders.values());
}
