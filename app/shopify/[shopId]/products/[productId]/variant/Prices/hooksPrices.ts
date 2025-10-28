import useShopifyStore from "@/components/shopify/shopifyStore";
import { createTaskShopify } from "@/library/models/tasksShopify/taskMiddleware";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { updateVariant } from "../../serverAction";
import useProductStore from "../../storeProduct";
import useTaskStore from "../../Tasks/storeTasks";
import { TFieldVariant } from "../../util";

export default function usePrices() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { typeTask, param, setParam } = useTaskStore();
    const { setPrice, compareAtPrice } = useProductStore();
    const router = useRouter();

    useEffect(() => {
        setParam(0);
    }, [typeTask]);

    if (!product || !shopifyBoutique) return null;
    const mainVariant = product.variants?.nodes[0];

    const handleUpdatePrices = async (field: TFieldVariant, value: number) => {
        if (!mainVariant) return;
        try {
            const res = await updateVariant(shopifyBoutique.domain, product.id, mainVariant.id, field, value);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du prix");
        } finally {
            setPrice(mainVariant.price);
        }
    };

    const addTaskStopPromotion = async () => {
        if (!mainVariant) return;
        const task: TTaskShopifyProducts = {
            status: "scheduled",
            activation: typeTask,
            timestampActivation: typeTask === "timestamp" ? param : 0,
            stockActivation: typeTask === "quantity" ? param : 0,
            productId: product.id,
            variantId: mainVariant.id,
            boutique: shopifyBoutique.domain,
            priceUpdate: Number(compareAtPrice),
            compareAtPrice: 0,
        };
        try {
            const res = await createTaskShopify(task);
            router.refresh();
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("Erreur lors de la création de la tâche");
        } finally {
            setParam(0);
        }
    };

    return {
        handleUpdatePrices,
        addTaskStopPromotion,
    };
}
