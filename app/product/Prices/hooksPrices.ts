import useShopifyStore from "@/components/shopify/shopifyStore";
import { createTaskShopify } from "@/library/models/tasksShopify/taskMiddleware";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { toast } from "sonner";
import useTaskStore from "../Tasks/storeTasks";
import usePriceStore from "./storePrice";
import { postServer } from "@/library/utils/fetchServer";
import { useEffect } from "react";

export default function usePrices() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { typeTask, param, setParam } = useTaskStore();
    const { setPrice, setCompareAtPrice, price, compareAtPrice } = usePriceStore();

    useEffect(() => {
        setParam(0);
    }, [typeTask]);

    if (!product || !shopifyBoutique) return null;
    const mainVariant = product.variants.nodes[0];

    const handleUpdatePrice = async () => {
        const url = "http://localhost:9100/shopify/update-price";
        const data = {
            domain: shopifyBoutique.domain,
            productId: product.id,
            variantId: mainVariant.id,
            price: Number(price),
        };
        try {
            const res = await postServer(url, data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du prix");
        } finally {
            setPrice(mainVariant.price);
        }
    };

    const handleUpdateCompareAtPrice = async () => {
        const url = "http://localhost:9100/shopify/update-compare-at-price";
        const data = {
            domain: shopifyBoutique.domain,
            productId: product.id,
            variantId: mainVariant.id,
            compareAtPrice: Number(compareAtPrice),
        };
        try {
            const res = await postServer(url, data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du prix barré");
        } finally {
            setCompareAtPrice(mainVariant.compareAtPrice || "0");
        }
    };

    const addTaskStopPromotion = async () => {
        const task: TTaskShopifyProducts = {
            status: "scheduled",
            activation: typeTask,
            timestampActivation: typeTask === "timestamp" ? param : 0,
            stockActivation: typeTask === "quantity" ? param : 0,
            sku: mainVariant.sku,
            boutique: shopifyBoutique.domain,
            priceUpdate: Number(compareAtPrice),
        };
        try {
            const res = await createTaskShopify(task);
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
        handleUpdatePrice,
        handleUpdateCompareAtPrice,
        addTaskStopPromotion,
    };
}
