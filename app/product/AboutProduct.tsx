import Amazon from "@/components/shopify/Product/Metafields/Amazon";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Copy } from "lucide-react";

export default function AboutProduct() {
    const { product, cssCard } = useShopifyStore();
    if (!product) return;
    const { handleCopy } = useCopy();
    const variant = product.variants?.nodes[0];
    const classCopy = "cursor-pointer transition-transform duration-500 ease-out active:scale-93";

    return (
        <Card className={cssCard}>
            <CardContent className="flex justify-between flex-wrap gap-4">
                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <p>Type de produit: {product.productType || "Non spécifié"}</p>
                    <p>Statut: {product.status}</p>
                    <p>Créé le: {new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
                    <p>Mis à jour le: {new Date(product.updatedAt).toLocaleDateString("fr-FR")}</p>
                    <p
                        className={"flex items-center gap-1 text-gray-700 " + classCopy}
                        onClick={() => handleCopy(variant.sku)}
                        title="Cliquer pour copier le SKU"
                    >
                        SKU: {variant.sku}
                        <Copy size={12} className="text-gray-500" />
                    </p>
                    {variant.barcode && (
                        <p
                            className={"flex items-center gap-1 text-gray-700 " + classCopy}
                            onClick={() => {
                                if (variant.barcode) handleCopy(variant.barcode, "Barcode copié !");
                            }}
                        >
                            Barcode: {variant.barcode}
                            <Copy size={12} className="text-gray-500" />
                        </p>
                    )}

                    <Amazon />
                </div>
            </CardContent>
        </Card>
    );
}
