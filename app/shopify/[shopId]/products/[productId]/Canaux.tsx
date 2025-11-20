import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProductGET } from "@/library/types/graph";
import { ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import useProductStore from "./storeProduct";
import { cssCard } from "./util";

export default function Canaux({ product }: { product: ProductGET }) {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { canauxProduct, setCanauxProduct } = useProductStore();
    const canauxP =
        product?.resourcePublicationsV2.nodes.map((c) => ({
            id: c.publication.id,
            isPublished: c.isPublished,
        })) || [];

    const setInitialCanaux = () => {
        const canauxActives = canauxBoutique.map((c) => {
            const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
            if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
            else return { id: c.id, isPublished: false, name: c.name };
        });
        setCanauxProduct(canauxActives);
    };

    useEffect(() => {
        setInitialCanaux();
    }, [product, canauxBoutique]);

    if (!shopifyBoutique) return null;

    const selectedCount = canauxP.filter((c) => c.isPublished).length;

    const handleClickCanal = (canalId: string) => {
        const thisCanal = canauxProduct.find((c) => c.id === canalId);
        if (!thisCanal) return;
        setCanauxProduct(canauxProduct.map((c) => (c.id === canalId ? { ...c, isPublished: !c.isPublished } : c)));
    };

    const allPublished = canauxProduct.every((c) => c.isPublished);

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
                                {selectedCount} {selectedCount !== 1 ? "canaux" : "canal"} actif{selectedCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => {
                        setCanauxProduct(
                            canauxProduct.map((c) => ({
                                ...c,
                                isPublished: !allPublished,
                            }))
                        );
                    }}
                    className={`
                                flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer mb-3
                                ${
                                    allPublished
                                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }
                            `}
                >
                    <Checkbox className="cursor-pointer" checked={allPublished} />
                    <Label className="flex-1 cursor-pointer font-medium text-sm w-full h-full bg-green">Tous</Label>
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
