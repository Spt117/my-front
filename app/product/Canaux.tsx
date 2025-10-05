import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ShoppingCart } from "lucide-react";
import useProductStore from "./storeProduct";
import { cssCard } from "./util";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

export default function Canaux() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { canaux } = useProductStore();

    if (!product || !shopifyBoutique) return null;

    const canauxProduct = product.resourcePublicationsV2.nodes;
    const selectedCount = canauxProduct.filter((c) => c.isPublished).length;

    return (
        <Card className={cssCard}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Canaux de vente</h3>
                            <p className="text-sm text-gray-500">
                                {selectedCount} canal{selectedCount !== 1 ? "aux" : ""} actif{selectedCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {canaux.map((canal) => {
                        const thisCanal = canauxProduct.find((c) => c.publication.id === canal.id);
                        let isPublished = false;
                        if (thisCanal) isPublished = thisCanal.isPublished;
                        return (
                            <div
                                key={canal.id}
                                className={`
                                flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer
                                ${
                                    isPublished
                                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }
                            `}
                            >
                                <Checkbox id={canal.id} checked={isPublished} />
                                <Label htmlFor={canal.id} className="flex-1 cursor-pointer font-medium text-sm">
                                    {canal.name}
                                </Label>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                        💡 Sélectionnez les canaux sur lesquels ce produit sera disponible à la vente
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
