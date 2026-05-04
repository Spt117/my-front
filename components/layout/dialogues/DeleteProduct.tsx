"use client";
import { updateProduct } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import { createUrlRedirects } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import RedirectBuilder, { RedirectTarget } from "./RedirectBuilder";

export default function DeleteProduct() {
    const { closeDialog, shopifyBoutique, product } = useShopifyStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [target, setTarget] = useState<RedirectTarget | null>(null);
    const router = useRouter();

    const onSave = async () => {
        if (!product || !shopifyBoutique || loading) {
            const msg = !product ? "Le produit est introuvable" : "La boutique Shopify n'est pas configurée";
            toast.error(msg);
            return;
        }
        if (!target) {
            toast.error("Choisis une cible de redirection");
            return;
        }
        setLoading(true);
        try {
            // 1) Création de la redirection
            const path = `/products/${product.handle}`;
            const redirRes = await createUrlRedirects(shopifyBoutique.domain, [{ path, target: target.target }]);
            if (redirRes?.error) {
                toast.error(`Redirection : ${redirRes.error}`);
                return;
            }
            const result = redirRes?.response?.results?.[0];
            if (!result?.success) {
                toast.error(`Redirection refusée par Shopify : ${result?.error || "raison inconnue"}`);
                return; // Le produit n'est PAS supprimé en cas d'échec.
            }

            // 2) Suppression du produit
            const data = await updateProduct(shopifyBoutique.domain, product.id, "Delete", " ");
            if (data.error) {
                toast.error(data.error);
                return;
            }
            toast.success(`Produit supprimé. Redirection ${path} → ${target.target}`);
            const url = `/shopify/${shopifyBoutique.id}/products`;
            router.push(url);
            closeDialog();
        } catch (error) {
            toast.error("Une erreur s'est produite lors de la suppression.");
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    const sourcePath = `/products/${product.handle}`;

    return (
        <div className="relative z-10 w-full bg-white flex flex-col p-6 gap-4 max-w-[560px]">
            <div className="flex items-start gap-3 border-b pb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={18} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">Supprimer le produit</h3>
                    <p className="text-sm text-slate-500 truncate" title={product.title}>
                        {product.title}
                    </p>
                </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs flex items-center gap-2">
                <span className="font-mono text-slate-700 truncate">{sourcePath}</span>
                <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                <span className="font-mono text-slate-500 truncate">{target?.target || "(à définir)"}</span>
            </div>

            <RedirectBuilder onChange={setTarget} />

            <p className="text-[11px] text-slate-500">
                La redirection 301 sera créée dans Shopify <strong>avant</strong> la suppression. Si Shopify la refuse, le produit n&apos;est pas supprimé.
            </p>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
                <Button disabled={loading} type="button" size="sm" variant="outline" onClick={closeDialog}>
                    Annuler
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={onSave} disabled={loading || !target}>
                    {loading ? (
                        <>
                            <Spinner className="mr-2" />
                            Suppression…
                        </>
                    ) : (
                        <>
                            <Trash2 size={14} className="mr-1.5" />
                            Supprimer + rediriger
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
