import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import useProductStore from "./storeProduct";
import { cssCard } from "./util";

export default function Statut() {
    const { product, shopifyBoutique, openDialog } = useShopifyStore();
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

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-6 relative">
                <h3 className="m-2 text-sm font-medium flex items-center gap-2">Statut</h3>
                <span title="Supprimer le produit">
                    <Trash2 className="mx-auto absolute top-2 right-2 cursor-pointer" size={20} onClick={() => openDialog(2)} />
                </span>
                <Selecteur array={statuts} value={statut} onChange={setStatut} placeholder="Statut" />
            </CardContent>
        </Card>
    );
}
