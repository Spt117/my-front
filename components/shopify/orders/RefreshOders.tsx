'use client';
import { CardHeader } from '@/components/ui/card';
import { useEventListener } from '@/library/hooks/useEvent/useEvents';
import { GroupedShopifyOrder } from '@/library/shopify/orders';
import { Archive, RefreshCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useShopifyStore from '../shopifyStore';
import MappingOrders from './MappingOrders';
import Products from './ModeProducts/Products';
import { getOrdersByShop } from './serverAction';
import useOrdersStore, { ProductInOrder } from './store';
import ToggleMode from './ToggleMode';

export default function RefreshOders({ boolArchived }: { boolArchived?: boolean }) {
    const [productsInOrders, setProductsInOrders] = useState<ProductInOrder[]>([]);
    const { loading, setLoading, shopifyBoutique } = useShopifyStore();
    const { setFilterOrders, setOrders, orders, setOrdersForShop } = useOrdersStore();
    const path = usePathname();
    const router = useRouter();

    useEventListener('orders/paid', () => handleGetOrders());

    const handleGetOrders = async () => {
        try {
            if (!shopifyBoutique) return;
            setLoading(true);

            const data = await getOrdersByShop(shopifyBoutique.domain);
            console.log(data);

            if (data) {
                const orders = data.orders.sort((a: GroupedShopifyOrder, b: GroupedShopifyOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(orders);
                setFilterOrders(orders);
                // Also store orders for this specific shop
                setOrdersForShop(shopifyBoutique.domain, orders);
                setProductsInOrders(data.products);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        handleGetOrders();
    }, [shopifyBoutique?.domain]);

    return (
        <>
            <CardHeader className="sticky top-12 w-full flex justify-center items-center z-10 bg-gray-50 ">
                <div className="relative w-full h-10">
                    {path.includes('/orders') && (
                        <>
                            <ToggleMode />
                            <RefreshCcw
                                className={`cursor-pointer inline-block mr-2 absolute top-2 left-5 transition-transform duration-300 ease-in-out ${
                                    loading ? 'animate-spin' : ''
                                } hover:scale-125 hover:rotate-45 hover:text-blue-500`}
                                onClick={handleGetOrders}
                            />
                        </>
                    )}
                    {/* {path !== "/" && (
                        <ArrowBigLeft
                            className={`cursor-pointer inline-block mr-2 absolute top-2 right-5 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-10 hover:text-blue-500`}
                            onClick={() => router.push("/")}
                        />
                    )} */}
                    {path.includes('/orders') && shopifyBoutique && (
                        <Archive
                            className={`cursor-pointer inline-block mr-2 absolute top-2 right-5 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-10 hover:text-blue-500`}
                            onClick={() => router.push(`/shopify/${shopifyBoutique.id}/orders/fulfilled`)}
                        />
                    )}
                </div>
            </CardHeader>
            <Products products={productsInOrders} />
            <MappingOrders />
        </>
    );
}
