"use client";

import { getProduct } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import useTaskStore from "./Tasks/storeTasks";
import { fetchVariant, getTasks } from "./serverAction";

interface ShopLayoutProps {
    children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
    const { shopifyBoutique, setLoading, setProduct, setVariant, product } = useShopifyStore();
    const params = useParams();
    const { setTasks } = useTaskStore();
    const productId = params.productId as string;

    useEffect(() => {
        const getProductData = async () => {
            if (!shopifyBoutique) return;
            setLoading(true);
            try {
                const dataParam = { productId: productId, domain: shopifyBoutique.domain };
                const data = await getProduct(dataParam);
                if (data) setProduct(data.response);
                if (data?.error) toast.error(data.error);
            } catch (error) {
                console.error("Error fetching boutique data:", error);
            } finally {
                setLoading(false);
            }
        };

        getProductData();
    }, [productId, shopifyBoutique]);

    useEffect(() => {
        const fetchTasks = async () => {
            const tasksData = await getTasks(productId);
            setTasks(tasksData);
        };
        fetchTasks();
    }, [shopifyBoutique, productId]);
    useEffect(() => {
        const fetchVariantData = async () => {
            if (!shopifyBoutique || !product) return;
            const variantData = await fetchVariant(product, shopifyBoutique.domain);
            setVariant(variantData);
        };
        fetchVariantData();
    }, [shopifyBoutique, product]);
    return <>{children}</>;
}
