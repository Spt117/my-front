import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import useProductStore from "./storeProduct";
import { cssCard, TCanal } from "./util";

export default function Canaux() {
    const { product, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { canauxProduct, setCanauxProduct } = useProductStore();
    const canauxActives =
        product?.resourcePublicationsV2.nodes.map((c) => ({
            id: c.publication.id,
            isPublished: c.isPublished,
        })) || [];

    useEffect(() => {
        const canauxActives = canauxBoutique.map((c) => {
            const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
            if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
            else return { id: c.id, isPublished: false, name: c.name };
        });
        setCanauxProduct(canauxActives);
    }, [product]);

    if (!product || !shopifyBoutique) return null;

    const selectedCount = canauxActives.filter((c) => c.isPublished).length;

    const handleClickCanal = (canalId: string) => {
        const thisCanal = canauxProduct.find((c) => c.id === canalId);
        if (!thisCanal) return;
        console.log("thisCanal", thisCanal);
        setCanauxProduct(canauxProduct.map((c) => (c.id === canalId ? { ...c, isPublished: !c.isPublished } : c)));
    };

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
                    {canauxProduct.map((canal) => {
                        const isPublished = canal.isPublished;
                        return (
                            <div
                                onClick={() => handleClickCanal(canal.id)}
                                key={canal.id}
                                className={`
                                flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer
                                ${
                                    isPublished
                                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }
                            `}
                            >
                                <Checkbox className="cursor-pointer" checked={isPublished} />
                                <Label className="flex-1 cursor-pointer font-medium text-sm w-full h-full bg-green">
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
