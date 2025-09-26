"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { boutiqueFromDomain, IShopify } from "@/library/params/paramsShopify";
import { useEffect } from "react";
import { toast } from "sonner";
import Product from "./Product/Product";
import { ResponseServer } from "./typesShopify";
import { ProductGET } from "@/library/types/graph";
import { TVariant } from "@/library/models/produits/Variant";

export default function ClientProduct({
    productData,
    shopify,
    variant,
}: {
    productData: ResponseServer<ProductGET>;
    shopify: IShopify;
    variant: TVariant | null;
}) {
    const { setShopifyBoutique, product, setProduct } = useShopifyStore();
    const boutique = boutiqueFromDomain(shopify.domain);

    useEffect(() => {
        setShopifyBoutique(boutique);
        setProduct(productData.response);
        if (productData.error) toast.error(productData.error);
    }, []);

    if (!productData.response || !product) return <div>Produit non trouvé</div>;
    return <Product />;
}
