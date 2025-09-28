"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { boutiqueFromDomain, IShopify } from "@/library/params/paramsShopify";
import { useEffect } from "react";
import { toast } from "sonner";
import Product from "./Product";
import { ResponseServer } from "../../components/shopify/typesShopify";
import { ProductGET } from "@/library/types/graph";
import { TVariant } from "@/library/models/produits/Variant";
import { getProduct } from "../../components/shopify/serverActions";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { getVariantBySku } from "@/library/models/produits/middlewareVariants";

export default function ClientProduct({ productData, shopify, variant }: { productData: ResponseServer<ProductGET>; shopify: IShopify; variant: TVariant | null }) {
    const { setShopifyBoutique, product, setProduct, setVariant } = useShopifyStore();
    const boutique = boutiqueFromDomain(shopify.domain);

    const getProductUpdated = async () => {
        const data = { productId: productData.response.id, domain: shopify.domain };
        const product = await getProduct(data);
        if (product) setProduct(product.response);
        const sku = product?.response.variants?.nodes[0]?.sku;
        if (sku) {
            const variantUpdated = await getVariantBySku(sku);
            if (variantUpdated) setVariant(variantUpdated);
        }
    };

    useEventListener("products/update", () => getProductUpdated());

    useEffect(() => {
        setShopifyBoutique(boutique);
        setProduct(productData.response);
        if (variant) setVariant(variant);
        if (productData.error) toast.error(productData.error);
    }, []);

    if (!productData.response || !product) return <div>Produit non trouvé</div>;
    return <Product />;
}
