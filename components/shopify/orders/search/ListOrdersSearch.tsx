"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Separator } from "@/components/ui/separator";
import useOrdersStore from "../store";
import OrderSearch from "./OrderSearch";

export default function ListOrdersSearch() {
    const { searchTerm, loading } = useShopifyStore();
    const { ordersSearch } = useOrdersStore();
    if (ordersSearch.length === 0 && !searchTerm) return null;

    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {ordersSearch.length > 0 &&
                ordersSearch
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((order, index) => <OrderSearch order={order} key={index} />)}
            {!loading && searchTerm && ordersSearch.length === 0 && (
                <div className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="relative w-12 h-12 flex-shrink-0"></div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">
                            Aucune commande trouvée pour "{searchTerm}"
                        </h3>
                    </div>
                </div>
            )}
            <Separator />
        </div>
    );
}
