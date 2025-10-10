"use client";
import MySpinner from "@/components/layout/my-spinner";
import { CanauxPublication } from "@/components/shopify/serverActions";
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
    canaux,
}: {
    tasksData: TTaskShopifyProducts[];
    productData: ResponseServer<ProductGET>;
    shopify: IShopify;
    variantData?: TVariant;
    canaux: CanauxPublication[];
}) {
    const { setShopifyBoutique, shopifyBoutique, product, setProduct, setVariant, setCanauxBoutique } = useShopifyStore();
    const router = useRouter();
    const { setTasks } = useTaskStore();

    useEventListener("products/update", (data) => getProductUpdated(data.productId, data));

    useEffect(() => {
        const canauxActives = canaux.map((c) => ({ id: c.id, isPublished: false, name: c.name }));
        setCanauxBoutique(canauxActives);
        const boutique = boutiqueFromDomain(shopify.domain);
        setShopifyBoutique(boutique);
        setTasks(tasksData);
        setProduct(productData.response);
        if (variantData) setVariant(variantData);
        if (productData.error) toast.error(productData.error);
    }, [shopify.domain, productData.response, variantData, tasksData, canaux]);

    const getProductUpdated = async (productId: string, data: any) => {
        const currentProduct = useShopifyStore.getState().product;
        if (!currentProduct) {
            toast.error("No current product in store. Cannot update.");
            return;
        }
        const idProduct = currentProduct?.id.replace("gid://shopify/Product/", "");
        if (Number(idProduct) === Number(productId)) {
            router.refresh();
            toast.success(`${currentProduct.title} a été mis à jour`);
        } else {
            toast.error("Product ID does not match. No update needed.");
            console.log(data);
        }
    };

    if (!product || !shopifyBoutique) {
        return <MySpinner active={true} />;
    }
}
