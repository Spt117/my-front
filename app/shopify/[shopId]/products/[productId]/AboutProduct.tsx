"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Copy } from "lucide-react";
import Amazon from "./Metafields/Amazon";
import { classCopy, cssCard } from "./util";

export default function AboutProduct() {
    const { product } = useShopifyStore();
    const { handleCopy } = useCopy();
    const variant = product?.variants?.nodes[0];

    if (!product || !variant) return null;
    return (
        <Card className={cssCard}>
            <CardContent className="flex flex-col justify-between h-full text-sm text-muted-foreground gap-2">
                <p>Type de produit: {product.productType || "Non spécifié"}</p>
                <p>Statut: {product.status}</p>
                <p>Créé le: {new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
                <p>Mis à jour le: {new Date(product.updatedAt).toLocaleDateString("fr-FR")}</p>
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
            </CardContent>
        </Card>
    );
}
