"use client";
import MySpinner from "@/components/layout/my-spinner";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { TVariant } from "@/library/models/variantShopify/Variant";
import { ProductGET } from "@/library/types/graph";
import { IShopify } from "@/params/paramsShopify";
import { useEffect } from "react";
import { toast } from "sonner";
import useTaskStore from "./Tasks/storeTasks";

export default function ProductClient({
    productData,
    shopify,
    variantData,
    tasksData,
}: {
    tasksData: TTaskShopifyProducts[];
    productData: ResponseServer<ProductGET>;
    shopify: IShopify;
    variantData?: TVariant | null;
}) {
    const { setShopifyBoutique, shopifyBoutique, product, setProduct, setVariant, canauxBoutique } = useShopifyStore();
    const { setTasks } = useTaskStore();

    useEffect(() => {
        setShopifyBoutique(shopify);
    }, [shopify]);

    useEffect(() => {
        setTasks(tasksData);
        setProduct(productData.response);
        if (variantData) setVariant(variantData);
        if (productData.error) toast.error(productData.error);
    }, [shopify.domain, productData.response, variantData, tasksData]);

    if (!product || !shopifyBoutique || canauxBoutique.length === 0) {
        return <MySpinner active={true} />;
    }
}
