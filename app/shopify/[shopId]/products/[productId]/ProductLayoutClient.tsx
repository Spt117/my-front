"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import useTaskStore from "./Tasks/storeTasks";
import { fetchVariant } from "./serverAction";
import useProductStore from "./storeProduct";

interface ProductLayoutClientProps {
    children: React.ReactNode;
    product: any;
    tasks: TTaskShopifyProducts[];
    boutique: any;
    productId: string;
    error: string | null;
}

export default function ProductLayoutClient({ children, product, tasks, boutique, productId, error }: ProductLayoutClientProps) {
    const { setProduct, setVariant, setShopifyBoutique } = useShopifyStore();
    const { setTasks } = useTaskStore();
    const { setPrice, setCompareAtPrice } = useProductStore();
    const router = useRouter();

    useEventListener("products/update", (data) => {
        console.log(Number(data.productId));
        console.log(Number(productId));
        if (Number(data.productId) === Number(productId)) {
            console.log("router refresh");
            router.refresh();
        }
    });

    // ✅ Initialisation avec les données serveur
    useEffect(() => {
        if (boutique) setShopifyBoutique(boutique);
        if (product) setProduct(product);
        if (tasks) setTasks(tasks);
        if (error) toast.error(error);
    }, [productId]);

    // ✅ Chargement des variants (nécessite le product)
    useEffect(() => {
        const loadVariants = async () => {
            if (!product || !boutique) return;

            try {
                const variantData = await fetchVariant(product, boutique.domain);
                setVariant(variantData);
            } catch (err) {
                console.error("Error fetching variants:", err);
            }
        };

        loadVariants();
    }, [product, boutique]);

    useEffect(() => {
        if (!product?.variants) return;
        setPrice(product?.variants.nodes[0].price || "0");
        setCompareAtPrice(product?.variants.nodes[0].compareAtPrice || "0");
        console.log("Prices set from product variants");
    }, [product]);

    return <>{children}</>;
}
