import TagsShopify from "@/app/product/Tags/Tags";
import AddImage from "@/components/shopify/Product/AddImage";
import HeaderProduct from "@/components/shopify/Product/HeaderProduct";
import ImagesProduct from "@/components/shopify/Product/Images";
import LinkToShops from "@/components/shopify/Product/LinkToShops";
import { Card, CardContent } from "@/components/ui/card";
import { TVariant } from "@/library/models/produits/Variant";
import AboutProduct from "./AboutProduct";
import ShopifyProductEditor from "./descriptionEditor/Editeur";
import Prices from "./Prices/Prices";
import VariantClient from "./VariantClient";

export default function ProductContent({ variantData }: { variantData: TVariant | undefined }) {
    if (!variantData) return null;
    return (
        <div className="@container/main flex flex-1 flex-col md:p-6">
            <Card className="m-0 p-0 border-0 shadow-none">
                <HeaderProduct />
                <CardContent className="flex gap-5 p-0  max-[1600px]:justify-center">
                    {/* Carrousel d'images */}
                    <ImagesProduct />
                    <div className="flex-1 flex p-1 gap-5 w-full max-[1600px]:flex-col">
                        <ShopifyProductEditor />
                        <div className="flex flex-wrap gap-3 justify-center w-full">
                            {/* Détails du produit */}
                            <Prices sku={variantData.sku} />
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
            <AddImage />
        </div>
    );
}
