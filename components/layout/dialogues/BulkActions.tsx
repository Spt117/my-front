import { addProductsToCollection } from "@/app/shopify/[shopId]/bulk/server";
import useBulkStore from "@/app/shopify/[shopId]/bulk/storeBulk";
import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BulkActions() {
    const { closeDialog, openDialog, shopifyBoutique } = useShopifyStore();
    const { collections } = useCollectionStore();
    const [action, setAction] = useState<string | null>(null);
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const { selectedProducts } = useBulkStore();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const bulkActions = [
        {
            label: "Ajouter à une collection",
            value: "add_to_collection",
        },
        { label: "Ajouter un tag", value: "add_tag" },
        { label: "Supprimer un tag", value: "remove_tag" },
        { label: "Mettre à jour le prix", value: "update_price" },
    ];
    const collectionsOptions = collections.filter((c) => !c.ruleSet).map((c) => ({ label: c.title, value: c.id }));
    const productIds = selectedProducts.map((p) => p.id);

    const handleAction = async () => {
        if (!shopifyBoutique?.domain) return;
        setLoading(true);
        try {
            switch (action) {
                case "add_to_collection":
                    if (collectionId) {
                        const res = await addProductsToCollection(shopifyBoutique.domain, collectionId, productIds);
                        if (res.error) toast.error(res.error);
                        if (res.message) {
                            toast.success(res.message);
                            router.push(
                                `/shopify/${shopifyBoutique.id}/collections/${collectionId.replace(
                                    "gid://shopify/Collection/",
                                    ""
                                )}`
                            );
                            closeDialog();
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error("Error during bulk action:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <X className="absolute right-4 top-4 cursor-pointer" onClick={closeDialog} />
            <div className="space-y-3">
                <span className="mb-1 block text-s font-medium text-slate-600">Choisir une action</span>
            </div>
            <div className="flex gap-3">
                <Selecteur
                    className="w-2/5"
                    array={bulkActions}
                    onChange={(value) => setAction(value)}
                    placeholder="Sélectionner une action"
                    value={action}
                />
                {action === "add_to_collection" && (
                    <Selecteur
                        className="w-2/5"
                        array={collectionsOptions}
                        onChange={(value) => setCollectionId(value)}
                        placeholder="Sélectionner une collection"
                        value={collectionId}
                    />
                )}
            </div>
            <div className="mt-4 flex flex-col justify-between gap-5">
                <div className="flex items-center gap-2 w-full"></div>
                <div className="flex gap-2 items-center justify-between">
                    <Button type="button" size="sm" disabled={loading} onClick={handleAction}>
                        Confirmer
                        {loading && <Spinner />}
                    </Button>
                    <Button disabled={loading} type="button" size="sm" variant="outline" onClick={() => openDialog(34)}>
                        Retour
                    </Button>
                </div>
            </div>
        </>
    );
}
