import AddImage from "@/components/shopify/Product/AddImage";
import HeaderProduct from "@/components/shopify/Product/HeaderProduct";
import ImagesProduct from "@/components/shopify/Product/Images";
import LinkToShops from "@/components/shopify/Product/LinkToShops";
import TagsShopify from "@/app/product/Tags/Tags";
import { Card, CardContent } from "@/components/ui/card";
import AboutProduct from "./AboutProduct";
import Description from "./Description";
import Prices from "./Prices/Prices";
import VariantClient from "./VariantClient";
import { TVariant } from "@/library/models/produits/Variant";

export default function ProductContent({ variantData }: { variantData: TVariant | undefined }) {
    if (!variantData) return null;
    return (
        <div className="@container/main flex flex-1 flex-col md:p-6">
            <Card className="m-0 p-0 border-0 shadow-none">
                <HeaderProduct />
                <CardContent className="flex gap-2 flex-wrap max-[1270px]:justify-center p-0">
                    {/* Carrousel d'images */}
                    <ImagesProduct />
                    <div className="flex-1 p-1">
                        <div className="flex flex-wrap gap-1 max-[1270px]:justify-center">
                            {/* Détails du produit */}

                            <Prices sku={variantData.sku} />
                            <VariantClient />
                            <TagsShopify />
                            <AboutProduct />
                            <LinkToShops />
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
