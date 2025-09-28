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

export default function Product({
    productData,
    shopify,
    variantData,
}: {
    productData: ResponseServer<ProductGET>;
    shopify: IShopify;
    variantData: TVariant | null;
}) {
    const { setShopifyBoutique, shopifyBoutique, product, setProduct, setVariant } = useShopifyStore();
    const { variant } = useShopifyStore();
    const boutique = boutiqueFromDomain(shopify.domain);

    const getProductUpdated = async (sku: string) => {
        console.log("Updating product for SKU:", sku);
        console.log("Current variant SKU:", variant);
        console.log("Current variantData SKU:", variantData);

        if (variantData?.sku !== sku) return;
        const data = { productId: productData.response.id, domain: shopify.domain };
        const product = await getProduct(data);
        if (product) setProduct(product.response);
        const v = await getVariantBySku(sku);
        if (v) setVariant(v);
    };

    useEventListener("products/update", (data) => getProductUpdated(data.sku));

    useEffect(() => {
        setShopifyBoutique(boutique);
        setProduct(productData.response);
        if (variantData) setVariant(variantData);
        if (productData.error) toast.error(productData.error);
    }, []);

    if (!product || !shopifyBoutique) {
        return <div className="text-center py-8 text-muted-foreground">Aucun produit sélectionné</div>;
    }

    return <ProductContent />;
}
