"use client";
import AddImage from "@/components/shopify/Product/AddImage";
import HeaderProduct from "@/components/shopify/Product/HeaderProduct";
import ImagesProduct from "@/components/shopify/Product/Images";
import LinkToShops from "@/components/shopify/Product/LinkToShops";
import TagsShopify from "@/components/shopify/Product/Tags/Tags";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { getVariantBySku } from "@/library/models/produits/middlewareVariants";
import { VariantStock } from "../stock/VariantStock";
import AboutProduct from "./AboutProduct";
import Description from "./Description";
import Prices from "./Prices";

export default function ProductContent() {
    const { variant, setVariant, product } = useShopifyStore();
    if (!product) return <div className="text-center py-8 text-muted-foreground">Aucun produit sélectionné</div>;

    const actionStoreVariant = async () => {
        if (!variant) return;
        const variantUpdated = await getVariantBySku(variant.sku);
        if (variantUpdated) setVariant(variantUpdated);
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <Card className="m-0 p-0 border-0 shadow-none">
                <HeaderProduct />

                <CardContent className="flex gap-2 flex-wrap">
                    {/* Carrousel d'images */}
                    <ImagesProduct />
                    <div className="flex-1 min-w-0 p-1">
                        <div className="flex flex-wrap gap-2">
                            {/* Détails du produit */}
                            <Prices />
                            {variant && <VariantStock variant={variant} action={actionStoreVariant} />}
                            <TagsShopify />
                            <AboutProduct />
                            <LinkToShops variant={variant} />
                            <Description />
                        </div>
                    </div>
                </CardContent>
                {/* <Metafields metafields={product.metafields.nodes} /> */}
                {/* Metafields */}
            </Card>
            <AddImage />
        </div>
    );
}
