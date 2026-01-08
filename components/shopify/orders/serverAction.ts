'use server';
import { GroupedShopifyOrder, IShopifyOrderResponse, ShopifyOrder } from '@/library/shopify/orders';
import { getServer, postServer } from '@/library/utils/fetchServer';
import { pokeUriServer } from '@/library/utils/uri';
import { ProductInOrder } from './store';

export async function getOrders() {
    const url = `${pokeUriServer}/shopify/orders`;
    const response = await getServer(url);
    if (!response || !response.response) return null;
    const data: ShopifyOrder[] = response.response;
    const filterOrdersProductsUnfulfilled = data.map((order) => ({
        ...order,
        lineItems: {
            edges: order.lineItems.edges.filter(({ node }) => {
                const status = (node.fulfillmentStatus || '').toLowerCase();
                return status !== 'fulfilled';
            }),
        },
    }));

    const products: ProductInOrder[] = filterOrdersProductsUnfulfilled.flatMap((order) =>
        order.lineItems.edges.flatMap(({ node }) => {
            const productId = node.variant?.product?.id?.split('/').pop() || '';
            return {
                title: node.title,
                image: node?.variant?.product?.featuredImage?.url || ' ',
                productUrl: productId ? `https://${order.shop}/admin/products/${productId}` : '#',
                quantity: node.quantity,
                fulfillmentStatus: node.fulfillmentStatus,
                shop: order.shop,
                sku: node.sku,
            };
        })
    );

    // Regroupement par SKU avec addition des quantités
    const groupedProducts: ProductInOrder[] = products.reduce((acc: ProductInOrder[], product) => {
        const existingProduct = acc.find((p) => p.sku === product.sku && p.shop === product.shop);

        if (existingProduct) {
            // Si le SKU existe déjà pour la même boutique, on additionne la quantité
            existingProduct.quantity += product.quantity;
        } else {
            // Sinon on ajoute le produit à l'accumulateur
            acc.push({ ...product });
        }

        return acc;
    }, []);

    return { orders: groupOrdersByCustomerEmail(filterOrdersProductsUnfulfilled), products: groupedProducts };
}

export async function getOrdersByShop(shopDomain: string) {
    const data = await getOrders();
    if (!data) return null;

    return {
        orders: data.orders.filter((order) => order.shop === shopDomain),
        products: data.products.filter((product) => product.shop === shopDomain),
    };
}

export async function searchOrders(domain: string, query: string) {
    const req = query.includes('@') ? 'orders-customer' : 'get-order';
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

export async function archiveOrder(domain: string, orderId: string) {
    const url = `${pokeUriServer}/shopify/archive-order`;
    const res = await postServer(url, { domain, orderId });
    return res;
}

function groupOrdersByCustomerEmail(orders: ShopifyOrder[]): GroupedShopifyOrder[] {
    const groupedOrders = new Map<string, GroupedShopifyOrder>();

    orders.forEach((order) => {
        const customerEmail = order.customer.email;

        if (groupedOrders.has(customerEmail)) {
            const existingOrder = groupedOrders.get(customerEmail)!;

            const sumAmount = (a: string, b: string) => (parseFloat(a) + parseFloat(b)).toFixed(2);

            // Additionner les montants (avec sécurité si les champs sont absents)
            const getAmount = (set: any) => set?.shopMoney?.amount || '0';

            existingOrder.totalPriceSet.shopMoney.amount = sumAmount(existingOrder.totalPriceSet.shopMoney.amount, getAmount(order.totalPriceSet));
            existingOrder.subtotalPriceSet.shopMoney.amount = sumAmount(existingOrder.subtotalPriceSet.shopMoney.amount, getAmount(order.subtotalPriceSet));
            existingOrder.totalDiscountsSet.shopMoney.amount = sumAmount(existingOrder.totalDiscountsSet.shopMoney.amount, getAmount(order.totalDiscountsSet));
            existingOrder.totalShippingPriceSet.shopMoney.amount = sumAmount(existingOrder.totalShippingPriceSet.shopMoney.amount, getAmount(order.totalShippingPriceSet));
            existingOrder.totalTaxSet.shopMoney.amount = sumAmount(existingOrder.totalTaxSet.shopMoney.amount, getAmount(order.totalTaxSet));
            existingOrder.totalReceivedSet.shopMoney.amount = sumAmount(existingOrder.totalReceivedSet.shopMoney.amount, getAmount(order.totalReceivedSet));

            // Additionner les quantités
            existingOrder.subtotalLineItemsQuantity = (existingOrder.subtotalLineItemsQuantity || 0) + (order.subtotalLineItemsQuantity || 0);

            // Ajouter le nom de la commande à l'array
            existingOrder.name.push(order.name);
            existingOrder.legacyResourceId.push(order.legacyResourceId);

            // Fusionner les line items
            existingOrder.lineItems.edges.push(...order.lineItems.edges);

            // Fusionner les détails (discounts, shipping, taxes)
            if (order.discountCodes) existingOrder.discountCodes.push(...order.discountCodes);
            if (order.shippingLines?.nodes) existingOrder.shippingLines.nodes.push(...order.shippingLines.nodes);
            if (order.taxLines) existingOrder.taxLines.push(...order.taxLines);

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
                discountCodes: order.discountCodes ? [...order.discountCodes] : [],
                shippingLines: {
                    nodes: order.shippingLines?.nodes ? [...order.shippingLines.nodes] : [],
                },
                taxLines: order.taxLines ? [...order.taxLines] : [],
            };

            groupedOrders.set(customerEmail, groupedOrder);
        }
    });

    return Array.from(groupedOrders.values());
}

// Types pour les fulfillment orders
export interface FulfillmentOrderLineItem {
    id: string;
    sku: string;
    totalQuantity: number;
    remainingQuantity: number;
    lineItemId: string;
}

export interface FulfillmentOrder {
    id: string;
    status: string;
    lineItems: FulfillmentOrderLineItem[];
}

export interface FulfillmentOrdersResponse {
    fulfillmentOrders: FulfillmentOrder[];
}

export async function getFulfillmentOrders(domain: string, orderId: string): Promise<FulfillmentOrdersResponse | null> {
    const url = `${pokeUriServer}/shopify/get-fulfillment-orders`;
    const res = await postServer(url, { domain, orderId });
    if (!res || !res.response) return null;
    return res.response as FulfillmentOrdersResponse;
}

export interface TrackingInfo {
    number: string;
    url?: string;
    company?: string;
}

export interface FulfillLineItemsParams {
    domain: string;
    orderId: string;
    lineItems: Array<{ fulfillmentOrderId: string; lineItemId: string; quantity: number }>;
    trackingInfo?: TrackingInfo;
}

export interface FulfillLineItemsResponse {
    success: boolean;
    fulfilledItems: string[];
    allFulfilled: boolean;
    archived: boolean;
    error?: string;
}

export async function fulfillLineItems(params: FulfillLineItemsParams): Promise<{ response: FulfillLineItemsResponse | null; message?: string; error?: string }> {
    const url = `${pokeUriServer}/shopify/fulfill-line-items`;
    const res = await postServer(url, params);
    return res;
}

export async function unarchiveOrder(domain: string, orderId: string): Promise<{ response: boolean; message?: string; error?: string }> {
    const url = `${pokeUriServer}/shopify/unarchive-order`;
    const res = await postServer(url, { domain, orderId });
    return res;
}

export interface Fulfillment {
    id: string;
    status: string;
    trackingInfo: string | null;
    trackingCompany: string | null;
}

export async function getFulfillments(domain: string, orderId: string): Promise<Fulfillment[]> {
    const url = `${pokeUriServer}/shopify/get-fulfillments`;
    const res = await postServer(url, { domain, orderId });
    if (!res || !res.response) return [];
    return res.response as Fulfillment[];
}

export async function cancelFulfillment(domain: string, fulfillmentId: string): Promise<{ response: boolean; message?: string; error?: string }> {
    const url = `${pokeUriServer}/shopify/cancel-fulfillment`;
    const res = await postServer(url, { domain, fulfillmentId });
    return res;
}

export async function updateOrderNote(domain: string, orderId: string, note: string): Promise<{ response: string | null; message?: string; error?: string }> {
    const url = `${pokeUriServer}/shopify/update-order-note`;
    const res = await postServer(url, { domain, orderId, note });
    return res;
}
