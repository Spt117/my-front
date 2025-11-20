import { deleteCollection } from "@/app/shopify/[shopId]/collections/server";
import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteCollection() {
    const { closeDialog } = useShopifyStore();

    const [loading, setLoading] = useState<boolean>(false);
    const { shopifyBoutique } = useShopifyStore();
    const { dataCollection } = useCollectionStore();
    const router = useRouter();

    if (!shopifyBoutique || !dataCollection) return null;
    const handleDeleteCollection = async () => {
        setLoading(true);
        try {
            const response = await deleteCollection(shopifyBoutique, dataCollection.id);
            if (response.message) {
                toast.success(response.message);
                router.push(`/shopify/${shopifyBoutique.id}/collections`);
                closeDialog();
            }
        } catch (error) {
            toast.error("Une erreur s'est produite lors de la suppression de la collection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-3">
                <span className="mb-1 block text-s font-medium text-slate-600">Supprimer {dataCollection.title}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex gap-2 items-center">
                    <Button disabled={loading} type="button" size="sm" variant="outline" onClick={closeDialog}>
                        Annuler
                    </Button>
                    {!loading && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteCollection}>
                            Confirmer
                        </Button>
                    )}
                    <Spinner className={`ml-2 ${loading ? "visible" : "invisible"}`} />
                </div>
            </div>
        </>
    );
}
