"use client";
import MySpinner from "@/components/layout/my-spinner";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { TVariant } from "@/library/models/produits/Variant";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { boutiqueFromDomain, IShopify } from "@/library/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import { useRouter } from "next/navigation";
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
    variantData?: TVariant;
}) {
    const { setShopifyBoutique, shopifyBoutique, product, setProduct, setVariant } = useShopifyStore();
    const router = useRouter();
    const { setTasks } = useTaskStore();

    useEventListener("products/update", (data) => getProductUpdated(data.productId));

    useEffect(() => {
        const boutique = boutiqueFromDomain(shopify.domain);
        setShopifyBoutique(boutique);
        setTasks(tasksData);
        setProduct(productData.response);
        if (variantData) setVariant(variantData);
        if (productData.error) toast.error(productData.error);
    }, [shopify.domain, productData.response, variantData, tasksData]);

    const getProductUpdated = async (productId: string) => {
        const currentProduct = useShopifyStore.getState().product;
        if (!currentProduct) {
            toast.error("No current product in store. Cannot update.");
            return;
        }
        const idProduct = currentProduct?.id.replace("gid://shopify/Product/", "");
        if (Number(idProduct) === Number(productId)) {
            router.refresh();
            toast.success(`${currentProduct.title} a été mis à jour`);
        } else toast.error("Product ID does not match. No update needed.");
    };

    if (!product || !shopifyBoutique) {
        return <MySpinner active={true} />;
    }
}
