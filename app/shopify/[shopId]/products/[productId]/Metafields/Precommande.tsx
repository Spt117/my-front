"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { postServer } from "@/library/utils/fetchServer";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { CalendarDays, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Precommande() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [dateValue, setDateValue] = useState("");
    const [loading, setLoading] = useState(false);
    const { getProductData } = useDataProduct();

    // Récupérer le metafield precommande existant
    const precommandeMeta = product?.metafields.nodes.find((mf) => mf.key === "precommande");

    useEffect(() => {
        if (precommandeMeta?.value) {
            // Formatter la date pour l'input (format YYYY-MM-DD)
            const date = new Date(precommandeMeta.value);
            if (!isNaN(date.getTime())) {
                setDateValue(date.toISOString().split("T")[0]);
            }
        } else {
            setDateValue("");
        }
    }, [precommandeMeta]);

    if (!product || !shopifyBoutique) return null;

    const handleSave = async () => {
        if (!dateValue) {
            toast.error("Veuillez sélectionner une date.");
            return;
        }

        setLoading(true);
        try {
            const res = await postServer("http://localhost:9100/shopify/update-metafield", {
                domain: shopifyBoutique.domain,
                productGid: product.id,
                key: "precommande",
                namespace: "custom",
                value: dateValue,
            });

            if (res?.error) {
                toast.error(res.error);
            } else if (res?.message) {
                await getProductData();
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour de la date de précommande.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await postServer("http://localhost:9100/shopify/update-metafield", {
                domain: shopifyBoutique.domain,
                productGid: product.id,
                key: "precommande",
                namespace: "custom",
                value: "",
            });

            if (res?.error) {
                toast.error(res.error);
            } else if (res?.message) {
                setDateValue("");
                await getProductData();
                toast.success("Date de précommande supprimée");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression de la date de précommande.");
        } finally {
            setLoading(false);
        }
    };

    // Formatter pour l'affichage
    const displayDate = precommandeMeta?.value
        ? new Date(precommandeMeta.value).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-orange-500" />
                <span className="font-medium">Précommande</span>
                {displayDate && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-sm font-semibold">
                        {displayDate}
                    </span>
                )}
            </div>

            <div className="flex gap-2 items-center">
                <Input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="w-auto"
                    disabled={loading}
                />
                <Button onClick={handleSave} disabled={loading || !dateValue} size="sm">
                    {loading ? <Spinner className="w-4 h-4" /> : "Enregistrer"}
                </Button>
                {precommandeMeta?.value && (
                    <Button
                        onClick={handleDelete}
                        disabled={loading}
                        size="sm"
                        variant="destructive"
                        title="Supprimer la date de précommande"
                    >
                        <X size={16} />
                    </Button>
                )}
            </div>

            {!precommandeMeta?.value && (
                <p className="text-sm text-muted-foreground">
                    Aucune date de précommande définie. Sélectionnez une date pour activer le mode précommande.
                </p>
            )}
        </div>
    );
}
