"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { getVariantBySku } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import { boutiqueFromDomain, IShopify } from "@/library/params/paramsShopify";
import { ProductGET } from "@/library/types/graph";
import { useEffect } from "react";
import { toast } from "sonner";
import { getProduct } from "../../components/shopify/serverActions";
import { ResponseServer } from "../../components/shopify/typesShopify";
import ProductContent from "./ProductContent";
import { useRouter } from "next/navigation";

export default function Product({
    productData,
    shopify,
    variantData,
}: {
    productData: ResponseServer<ProductGET>;
    shopify: IShopify;
    variantData: TVariant | null;
}) {
    const { setShopifyBoutique, shopifyBoutique, product, setProduct, setVariant, variant } = useShopifyStore();
    const router = useRouter();
    useEventListener("products/update", (data) => getProductUpdated(data.sku));

    useEffect(() => {
        const boutique = boutiqueFromDomain(shopify.domain);
        setShopifyBoutique(boutique);
        setProduct(productData.response);
        if (variantData) setVariant(variantData);
        if (productData.error) toast.error(productData.error);
    }, [shopify.domain, productData.response, variantData]);

    useEffect(() => {
        console.log("Variant Data ", variantData);
        console.log("Variant Store ", variant);
    }, [variantData, variant]);

    const getProductUpdated = async (sku: string) => {
        // Récupérer les valeurs fraîches directement du store
        // const currentVariant = useShopifyStore.getState().variant;
        // const currentProduct = useShopifyStore.getState().product;

        // if (!currentProduct) {
        //     console.log("No current product in store. Cannot update.");
        //     return;
        // }
        // if (currentVariant?.sku !== sku) {
        //     console.log("SKU does not match the current variant. No update needed.");
        //     return;
        // }

        // console.log("Fetching updated product data...");
        // const data = { productId: currentProduct.id, domain: shopify.domain };
        // const product = await getProduct(data);
        // if (product) setProduct(product.response);
        // const v = await getVariantBySku(sku);
        // if (v) setVariant(v);
        router.refresh();
        toast.success(`Le produit ${sku} a été mis à jour`);
    };

    if (!product || !shopifyBoutique) {
        return <div className="text-center py-8 text-muted-foreground">Aucun produit sélectionné</div>;
    }

    return <ProductContent />;
}
