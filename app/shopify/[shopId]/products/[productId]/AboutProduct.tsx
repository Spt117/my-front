"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Calendar, Clock, Copy, Package } from "lucide-react";
import { classCopy, cssCard } from "./util";

/**
 * Composant affichant les informations de base du produit
 * - Type de produit
 * - Dates de création/modification
 * - Code-barres
 */
export default function AboutProduct() {
    const { product } = useShopifyStore();
    const { handleCopy } = useCopy();
    const variant = product?.variants?.nodes[0];

    if (!product || !variant) return null;

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <Package size={16} />
                    Informations produit
                </h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Créé le</span>
                    </div>
                    <span className="font-medium">{new Date(product.createdAt).toLocaleDateString("fr-FR")}</span>

                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        <span>Modifié le</span>
                    </div>
                    <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString("fr-FR")}</span>
                </div>

                {variant.barcode && (
                    <div
                        className={"flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-md " + classCopy}
                        onClick={() => handleCopy(variant.barcode!, "Barcode copié !")}
                    >
                        <span className="text-gray-500">Barcode:</span>
                        <span className="font-mono font-medium">{variant.barcode}</span>
                        <Copy size={12} className="text-gray-400 ml-auto" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
