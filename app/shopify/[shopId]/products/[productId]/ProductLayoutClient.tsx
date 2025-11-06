"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import useTaskStore from "./Tasks/storeTasks";
import { fetchVariant } from "./serverAction";

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
    const router = useRouter();

    useEventListener("products/update", (data) => {
        console.log(Number(data.productId));
        console.log(Number(productId));
        if (Number(data.productId) === Number(productId)) router.refresh();
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

    return <>{children}</>;
}
