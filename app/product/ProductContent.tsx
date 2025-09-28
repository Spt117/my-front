import HeaderProduct from "@/components/shopify/Product/HeaderProduct";
import ImagesProduct from "@/components/shopify/Product/Images";
import LinkToShops from "@/components/shopify/Product/LinkToShops";
import Metafields from "@/components/shopify/Product/Metafields/Metafields";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { getVariantBySku } from "@/library/models/produits/middlewareVariants";
import { Separator } from "@radix-ui/react-select";
import { VariantStock } from "../stock/VariantStock";
import Prices from "./Prices";
import TagsShopify from "@/components/shopify/Product/Tags/Tags";

export default function ProductContent() {
    const { variant, setVariant, product } = useShopifyStore();
    if (!product) return;

    const actionStoreVariant = async () => {
        if (!variant) return;
        const variantUpdated = await getVariantBySku(variant.sku);
        if (variantUpdated) setVariant(variantUpdated);
    };

    return (
        <Card className="m-0 p-0 border-0 shadow-none">
            <HeaderProduct />

            <CardContent className="grid flex gap-6 flex-wrap md:flex-nowrap md:grid-cols-2">
                {/* Carrousel d'images */}
                <ImagesProduct />
                {/* Détails du produit */}
                <div className="flex gap-2 flex-wrap">
                    <Prices />
                    {variant && <VariantStock variant={variant} action={actionStoreVariant} />}
                    <TagsShopify />

                    <LinkToShops variant={variant} />

                    {/* Metafields */}
                    <Metafields metafields={product.metafields.nodes} />
                </div>
            </CardContent>
            <Separator />
            <CardContent className="pt-4 space-y-4">
                {/* Description */}
                <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    <div
                        className="text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{
                            __html: product.descriptionHtml || "<p>Aucune description disponible</p>",
                        }}
                    />
                </div>

                {/* Informations supplémentaires */}
                <div className="text-sm text-muted-foreground">
                    <p>Type de produit: {product.productType || "Non spécifié"}</p>
                    <p>Statut: {product.status}</p>
                    <p>Créé le: {new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
                    <p>Mis à jour le: {new Date(product.updatedAt).toLocaleDateString("fr-FR")}</p>
                </div>
            </CardContent>
        </Card>
    );
}
