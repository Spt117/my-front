import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleDot, Zap } from "lucide-react";
import { updateCanauxVente, updateProduct } from "./serverAction";
import useProductStore from "./storeProduct";
import { cssCard } from "./util";

/**
 * Composant pour gérer le statut du produit (Actif, Brouillon, Archivé)
 * Inclut une option de publication rapide pour activer le produit et ses canaux en un clic
 */
export default function Statut() {
    const [loading, setLoading] = useState(false);
    const { product, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { statut, setStatut } = useProductStore();
    const router = useRouter();
    const { getProductData } = useDataProduct();

    useEffect(() => {
        if (product?.status) setStatut(product.status);
    }, [product?.status, setStatut]);

    if (!product || !shopifyBoutique) return null;

    const statuts = [
        { label: "🟢 Actif", value: "ACTIVE" },
        { label: "📝 Brouillon", value: "DRAFT" },
        { label: "📦 Archivé", value: "ARCHIVED" },
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
            router.refresh();
        } catch (err) {
            console.log(err);
            toast.error("Erreur lors de la sauvegarde des canaux de vente");
        }
        await getProductData();
        setLoading(false);
    };

    // Couleur du badge selon le statut
    const getStatusColor = () => {
        switch (product.status) {
            case "ACTIVE":
                return "bg-green-100 text-green-700 border-green-200";
            case "DRAFT":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "ARCHIVED":
                return "bg-gray-100 text-gray-600 border-gray-200";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                        <CircleDot size={16} />
                        Statut du produit
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}>
                        {product.status === "ACTIVE" ? "Actif" : product.status === "DRAFT" ? "Brouillon" : "Archivé"}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Selecteur
                        array={statuts}
                        value={statut}
                        onChange={setStatut}
                        placeholder="Statut"
                        className="flex-1 min-w-[150px]"
                    />
                    
                    {product.status !== "ACTIVE" && (
                        <Button 
                            disabled={loading} 
                            onClick={handleQuickPublish}
                            className="flex items-center gap-2"
                        >
                            <Zap size={16} />
                            Publication rapide
                            {loading && <Spinner className="ml-1" />}
                        </Button>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                        <p className="text-gray-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                            Créé le
                        </p>
                        <p className="text-gray-700 font-semibold bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                            {new Date(product.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                            Modifié le
                        </p>
                        <p className="text-gray-700 font-semibold bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100">
                            {new Date(product.updatedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
