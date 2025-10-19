"use client";
import HeaderProduct from "@/app/product/Header/HeaderProduct";
import ImagesProduct from "@/app/product/images/Images";
import TagsShopify from "@/app/product/Tags/Tags";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { boutiques } from "@/params/paramsShopify";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import EditeurHtml from "../../components/editeurHtml/Editeur";
import AboutProduct from "./AboutProduct";
import Canaux from "./Canaux";
import Collections from "./Collections";
import HeaderEditeur from "./Header/HeaderEditeur";
import Metafields from "./Metafields/Metafields";
import MetafieldToClean from "./Metafields/MetafieldToClean";
import MetaSeo from "./Metafields/MetaSeo";
import Video from "./Metafields/Video";
import Statut from "./Statut";
import Prices from "./variant/Prices/Prices";
import Sku from "./variant/Sku";
import VariantClient from "./VariantClient";

export default function ProductContent() {
    const { setMySpinner, shopifyBoutique, product, setShopifyBoutique } = useShopifyStore();
    const query = useSearchParams();

    useEffect(() => {
        if (!shopifyBoutique && query.size === 0) setShopifyBoutique(boutiques[0]);
    }, [shopifyBoutique, setShopifyBoutique]);

    useEffect(() => {
        if (product && shopifyBoutique) setMySpinner(false);
    }, [product, shopifyBoutique]);

    if (!product || !shopifyBoutique) return null;
    return (
        <div className="@container/main flex flex-1 flex-col relative">
            <Card className="m-0 p-0 border-0 shadow-none">
                <HeaderProduct />
                <CardContent className="flex flex-wrap gap-5 p-2 justify-center max-[1600px]:justify-center ">
                    {/* Carrousel d'images */}

                    <div className="flex-1 flex p-1 gap-5 flex-col lg:max-w-[40vw] ">
                        <EditeurHtml html={product?.descriptionHtml}>
                            <HeaderEditeur />
                        </EditeurHtml>
                        <ImagesProduct />
                        <Video />
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center lg:max-w-[30vw] h-min">
                        {/* Détails du produit */}
                        <Statut />
                        <Canaux product={product} />
                        <Collections />
                        <TagsShopify />
                        <MetaSeo />
                        <Prices />
                        <Sku />
                        <AboutProduct />
                        {/* <LinkToShops /> */}
                        <VariantClient />
                        <Metafields metafields={product.metafields.nodes} />
                        <MetafieldToClean />
                    </div>
                </CardContent>
                {/* Metafields */}
            </Card>
            {/* <Metafields metafields={product.metafields.nodes} /> */}
            {/* Metafields */}
        </div>
    );
}
