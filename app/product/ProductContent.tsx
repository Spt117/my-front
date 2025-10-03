"use client";
import TagsShopify from "@/app/product/Tags/Tags";
import HeaderProduct from "@/components/shopify/Product/HeaderProduct";
import ImagesProduct from "@/components/shopify/Product/Images";
import LinkToShops from "@/components/shopify/Product/LinkToShops";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import AboutProduct from "./AboutProduct";
import ShopifyProductEditor from "./descriptionEditor/Editeur";
import Prices from "./Prices/Prices";
import VariantClient from "./VariantClient";

export default function ProductContent() {
    const { setMySpinner, shopifyBoutique, product } = useShopifyStore();

    useEffect(() => {
        if (product && shopifyBoutique) setMySpinner(false);
    }, [product, shopifyBoutique]);

    if (!product || !shopifyBoutique) {
        return null;
    }
    return (
        <div className="@container/main flex flex-1 flex-col relative">
            <Card className="m-0 p-0 border-0 shadow-none">
                <HeaderProduct />
                <CardContent className="flex gap-5 p-2 max-[1600px]:justify-center">
                    {/* Carrousel d'images */}
                    <ImagesProduct />

                    <div className="flex-1 flex p-1 gap-5 w-full max-[1600px]:flex-col">
                        <ShopifyProductEditor />
                        <div className="flex flex-wrap gap-3 justify-center w-full">
                            {/* Détails du produit */}
                            <Prices />
                            <VariantClient />
                            <TagsShopify />
                            <AboutProduct />
                            <LinkToShops />
                        </div>
                    </div>
                </CardContent>
                {/* <Metafields metafields={product.metafields.nodes} /> */}
                {/* Metafields */}
            </Card>
            {/* <Metafields metafields={product.metafields.nodes} /> */}
            {/* Metafields */}
        </div>
    );
}
