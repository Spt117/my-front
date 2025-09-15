"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { boutiqueFromDomain, IShopify } from "@/library/params/paramsShopify";
import { IShopifyProductResponse } from "@/components/header/products/shopifySearch";
import { useEffect } from "react";
import { toast } from "sonner";
import Product from "./Product/Product";

export default function ClientProduct({ productData, shopify }: { productData: IShopifyProductResponse; shopify: IShopify }) {
    const { setShopifyBoutique, product, setProduct } = useShopifyStore();
    const boutique = boutiqueFromDomain(shopify.domain);

    useEffect(() => {
        setShopifyBoutique(boutique);
        setProduct(productData.response);
        if (productData.error) toast.error(productData.error);
        if (productData.message) toast.success(productData.message);
    }, []);
    if (!productData.response || !product) return <div>Produit non trouvé</div>;
    return <Product />;
}
