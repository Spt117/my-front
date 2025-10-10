import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateCanauxVente, updateProduct } from "./serverAction";
import useProductStore from "./storeProduct";
import { cssCard } from "./util";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function Statut() {
    const [loading, setLoading] = useState(false);
    const { product, shopifyBoutique, openDialog, canauxBoutique } = useShopifyStore();
    const { statut, setStatut } = useProductStore();

    useEffect(() => {
        if (product?.status) setStatut(product.status);
    }, [product?.status, setStatut]);

    if (!product || !shopifyBoutique) return null;

    const statuts = [
        { label: "Actif", value: "ACTIVE" },
        { label: "Brouillon", value: "DRAFT" },
        { label: "Archiver", value: "ARCHIVED" },
    ];

    const handleQuickPublish = async () => {
        setLoading(true);
        try {
            const res = await updateProduct(shopifyBoutique.domain, product.id, "Statut", "ACTIVE");
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (err) {
            console.log(err);
            toast.error("Erreur lors de la publication rapide !");
        }
        try {
            const res = await updateCanauxVente(shopifyBoutique.domain, product.id, canauxBoutique);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (err) {
            console.log(err);
            toast.error("Erreur lors de la sauvegarde des canaux de vente");
        }
        setLoading(false);
    };

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-6 relative">
                <h3 className="m-2 text-sm font-medium flex items-center gap-2">Statut</h3>
                <div className="flex items-center gap-4 sm:gap-6 max-xl:flex-wrap sm:w-min">
                    <Selecteur className="w-full" array={statuts} value={statut} onChange={setStatut} placeholder="Statut" />
                    {product.status !== "ACTIVE" && (
                        <Button disabled={loading} onClick={handleQuickPublish}>
                            Publication rapide
                            {loading && <Spinner />}
                        </Button>
                    )}
                    <Button className="max-xl:w-full" disabled={loading} onClick={() => openDialog(2)} variant="destructive">
                        Supprimer
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
