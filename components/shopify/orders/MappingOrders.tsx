import { Switch } from '@/components/ui/switch';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { CalendarOff } from 'lucide-react';
import { useMemo } from 'react';
import OrderCompact from './OrderCompact';
import useOrdersStore from './store';

interface DisplayedOrder {
    order: GroupedShopifyOrder;
    hiddenPreorderCount: number; // Number of preorder items hidden for this customer
}

export default function MappingOrders() {
    const { filterOrders, mode, hidePreorders, setHidePreorders } = useOrdersStore();

    // Process orders when hidePreorders is enabled
    const displayedOrders: DisplayedOrder[] = useMemo(() => {
        if (!hidePreorders) {
            return filterOrders.map((order) => ({ order, hiddenPreorderCount: 0 }));
        }

        return filterOrders
            .map((groupedOrder) => {
                // Determine which order names have preorders
                const orderNamesWithPreorders = new Set<string>();
                groupedOrder.lineItems.edges.forEach(({ node }) => {
                    if (node.variant?.product?.precommande?.value && node.orderName) {
                        orderNamesWithPreorders.add(node.orderName);
                    }
                });

                // If no preorders in the whole group, keep it as is
                if (orderNamesWithPreorders.size === 0) {
                    return { order: groupedOrder, hiddenPreorderCount: 0 };
                }

                // Identify order names without preorders
                const cleanOrderNames = groupedOrder.name.filter(name => !orderNamesWithPreorders.has(name));

                // If all orders in the group have preorders, hide the entire group
                if (cleanOrderNames.length === 0) {
                    return null;
                }

                // Create a filtered version of the grouped order
                // We keep only the line items belonging to clean orders
                const cleanLineItems = groupedOrder.lineItems.edges.filter(({ node }) => 
                    node.orderName && cleanOrderNames.includes(node.orderName)
                );

                // We also need to filter the resource IDs to match the names
                const cleanLegacyResourceIds = groupedOrder.legacyResourceId.filter((_, index) => 
                    cleanOrderNames.includes(groupedOrder.name[index])
                );

                const filteredOrder: GroupedShopifyOrder = {
                    ...groupedOrder,
                    name: cleanOrderNames,
                    legacyResourceId: cleanLegacyResourceIds,
                    lineItems: {
                        edges: cleanLineItems
                    }
                };

                return {
                    order: filteredOrder,
                    hiddenPreorderCount: orderNamesWithPreorders.size // This is the count of hidden ORDERS for this customer
                };
            })
            .filter((item): item is DisplayedOrder => item !== null);
    }, [filterOrders, hidePreorders]);


    const totalOrders = displayedOrders.reduce((acc, { order }) => acc + order.name.length, 0);
    
    // Count orders that have preorders (not items, but orders)
    const preorderOrderCount = filterOrders.filter((order) =>
        order.lineItems.edges.some(({ node }) => node.variant?.product?.precommande?.value)
    ).length;

    if (mode !== 'orders') return null;
    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-between items-center mx-3 my-4 backdrop-blur-md bg-white/30 p-2 rounded-xl border border-white/40 shadow-sm sticky top-22 z-10">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 px-2">
                    {totalOrders} commandes ({displayedOrders.length} clients)
                </h1>
                {preorderOrderCount > 0 && (
                    <div
                        onClick={() => setHidePreorders(!hidePreorders)}
                        className="group cursor-pointer flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-200/80 transition-colors"
                    >
                        <CalendarOff size={16} className={hidePreorders ? 'text-red-500' : 'text-gray-400'} />
                        <span className="text-sm font-medium text-gray-700">
                            Masquer précommandes
                            <span className="ml-1 text-xs text-gray-500">({preorderOrderCount})</span>
                        </span>
                        <Switch checked={hidePreorders} className="pointer-events-none" />

                    </div>
                )}
            </div>

            <div className="space-y-2">
                {displayedOrders.map(({ order, hiddenPreorderCount }, index) => (
                    <OrderCompact key={index} order={order} hiddenPreorderCount={hiddenPreorderCount} />
                ))}
            </div>
        </div>
    );
}
