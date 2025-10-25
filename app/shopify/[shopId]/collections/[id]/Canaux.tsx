import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { cssCard } from "../../products/[productId]/util";
import useCollectionStore from "../storeCollections";
import { ShopifyCollectionWithProducts } from "../utils";

export default function Canaux({ collection }: { collection: ShopifyCollectionWithProducts }) {
    const { shopifyBoutique, canauxBoutique, openDialog } = useShopifyStore();
    const { setCanauxCollection, canauxCollection } = useCollectionStore();
    const canauxP =
        collection?.resourcePublicationsV2.nodes.map((c) => ({
            id: c.publication.id,
            isPublished: c.isPublished,
        })) || [];

    const setInitialCanaux = () => {
        const canauxActives = canauxBoutique.map((c) => {
            const found = collection?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
            if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
            else return { id: c.id, isPublished: false, name: c.name };
        });
        setCanauxCollection(canauxActives);
    };

    useEffect(() => {
        setInitialCanaux();
    }, [collection, canauxBoutique]);

    if (!shopifyBoutique) return null;

    const selectedCount = canauxP.filter((c) => c.isPublished).length;

    const handleClickCanal = (canalId: string) => {
        const thisCanal = canauxCollection.find((c) => c.id === canalId);
        if (!thisCanal) return;
        setCanauxCollection(canauxCollection.map((c) => (c.id === canalId ? { ...c, isPublished: !c.isPublished } : c)));
    };

    useKeyboardShortcuts("Escape", () => {
        setInitialCanaux();
    });
    const allPublished = canauxCollection.every((c) => c.isPublished);

    return (
        <Card className={cssCard}>
            <Trash2 className="mt-4 cursor-pointer absolute right-4 top-0" onClick={() => openDialog(6)} />
            <CardContent className="p-3">
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
                        setCanauxCollection(
                            canauxCollection.map((c) => ({
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
                    {canauxCollection.map((canal) => {
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
