import { actionBulk, addProductsToCollection } from "@/app/shopify/[shopId]/bulk/server";
import useBulkStore from "@/app/shopify/[shopId]/bulk/storeBulk";
import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { BulkAction } from "@/components/shopify/typesShopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Rocket, Tag, FolderPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Composant pour les actions en masse sur les produits sélectionnés
 * Actions disponibles: Publication rapide, Ajouter à collection, Ajouter/Supprimer tag
 */
export default function BulkActions() {
    const { closeDialog, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { collections } = useCollectionStore();
    const [action, setAction] = useState<string | null>(null);
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [tag, setTag] = useState<string>("");
    const { selectedProducts } = useBulkStore();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const bulkActions = [
        {
            label: (
                <span className="flex items-center gap-2">
                    <Rocket size={16} className="text-green-500" />
                    Publication rapide
                </span>
            ),
            value: "quick_publish",
        },
        {
            label: (
                <span className="flex items-center gap-2">
                    <FolderPlus size={16} className="text-blue-500" />
                    Ajouter à une collection
                </span>
            ),
            value: "add_to_collection",
        },
        {
            label: (
                <span className="flex items-center gap-2">
                    <Tag size={16} className="text-purple-500" />
                    Ajouter un tag
                </span>
            ),
            value: "add_tag",
        },
        {
            label: (
                <span className="flex items-center gap-2">
                    <Tag size={16} className="text-red-500" />
                    Supprimer un tag
                </span>
            ),
            value: "remove_tag",
        },
    ];

    const collectionsOptions = collections.filter((c) => !c.ruleSet).map((c) => ({ label: c.title, value: c.id }));
    const productIds = selectedProducts.map((p) => p.id);

    const handleAction = async () => {
        if (!shopifyBoutique?.domain) return;
        setLoading(true);
        
        try {
            switch (action) {
                case "quick_publish": {
                    // Publication rapide: mettre en ACTIVE + publier sur tous les canaux
                    const canauxIds = canauxBoutique.map((c) => c.id);
                    const payload: BulkAction = {
                        productsId: productIds,
                        domain: shopifyBoutique.domain,
                        actionType: "quick_publish",
                        canauxIds,
                    };
                    const res = await actionBulk(payload);
                    if (res.error) toast.error(res.error);
                    if (res.message) toast.success(res.message);
                    closeDialog();
                    router.refresh();
                    break;
                }

                case "add_to_collection": {
                    if (collectionId) {
                        const res = await addProductsToCollection(shopifyBoutique.domain, collectionId, productIds);
                        if (res.error) toast.error(res.error);
                        if (res.message) {
                            toast.success(res.message);
                            router.push(`/shopify/${shopifyBoutique.id}/collections/${collectionId.replace("gid://shopify/Collection/", "")}`);
                            closeDialog();
                        }
                    }
                    break;
                }

                case "add_tag": {
                    if (tag) {
                        const payload: BulkAction = {
                            productsId: productIds,
                            domain: shopifyBoutique.domain,
                            actionType: "tag",
                            tag: tag,
                            type: "add",
                        };
                        const res = await actionBulk(payload);
                        if (res.error) toast.error(res.error);
                        if (res.message) toast.success(res.message);
                        closeDialog();
                    }
                    break;
                }

                case "remove_tag": {
                    if (tag) {
                        const payload: BulkAction = {
                            productsId: productIds,
                            domain: shopifyBoutique.domain,
                            actionType: "tag",
                            tag: tag,
                            type: "remove",
                        };
                        const res = await actionBulk(payload);
                        if (res.error) toast.error(res.error);
                        if (res.message) toast.success(res.message);
                        closeDialog();
                    }
                    break;
                }
            }
        } catch (error) {
            console.error("Error during bulk action:", error);
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    // Vérification si l'action peut être exécutée
    const canExecute = () => {
        if (!action) return false;
        if (action === "quick_publish") return true;
        if (action === "add_to_collection") return !!collectionId;
        if (action === "add_tag" || action === "remove_tag") return !!tag.trim();
        return false;
    };

    return (
        <div className="relative">
            <button 
                onClick={closeDialog} 
                className="absolute right-0 top-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X size={20} className="text-gray-500" />
            </button>

            <div className="space-y-4 pt-2">
                <div>
                    <h2 className="text-lg font-semibold mb-1">Actions en masse</h2>
                    <p className="text-sm text-gray-500">
                        {selectedProducts.length} produit{selectedProducts.length > 1 ? "s" : ""} sélectionné{selectedProducts.length > 1 ? "s" : ""}
                    </p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Choisir une action
                        </label>
                        <Selecteur
                            className="w-full"
                            array={bulkActions}
                            onChange={(value) => setAction(value)}
                            placeholder="Sélectionner une action"
                            value={action}
                        />
                    </div>

                    {/* Options supplémentaires selon l'action */}
                    {action === "add_to_collection" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Collection cible
                            </label>
                            <Selecteur
                                className="w-full"
                                array={collectionsOptions}
                                onChange={(value) => setCollectionId(value)}
                                placeholder="Sélectionner une collection"
                                value={collectionId}
                            />
                        </div>
                    )}

                    {(action === "add_tag" || action === "remove_tag") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {action === "add_tag" ? "Tag à ajouter" : "Tag à supprimer"}
                            </label>
                            <Input
                                onChange={(e) => setTag(e.target.value.trim())}
                                type="text"
                                placeholder={action === "add_tag" ? "Entrer le tag à ajouter" : "Entrer le tag à supprimer"}
                            />
                        </div>
                    )}

                    {action === "quick_publish" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                                <strong>Publication rapide</strong> : Les produits sélectionnés seront mis en statut 
                                <span className="font-semibold"> Actif</span> et publiés sur 
                                <span className="font-semibold"> {canauxBoutique.length} canaux</span>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2 border-t">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={closeDialog}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={loading || !canExecute()}
                        onClick={handleAction}
                    >
                        {loading ? (
                            <>
                                <Spinner className="mr-2" />
                                En cours...
                            </>
                        ) : (
                            "Confirmer"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
