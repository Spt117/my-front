import { updateProduct } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteProduct() {
    const { closeDialog } = useShopifyStore();

    const [loading, setLoading] = useState<boolean>(false);
    const { shopifyBoutique, product } = useShopifyStore();
    const router = useRouter();

    const onSave = async () => {
        if (!product || !shopifyBoutique || loading) {
            const msg = !product ? "Le produit est introuvable" : "La boutique Shopify n'est pas configurée";
            toast.error(msg);
            return;
        }
        setLoading(true);
        try {
            const data = await updateProduct(shopifyBoutique.domain, product.id, "Delete", " ");
            if (data.error) toast.error(data.error);
            if (data.message) toast.success(data.message);
            router.push("/product");
            router.refresh();
        } catch (error) {
            toast.error("Une erreur s'est produite lors de la création du produit.");
        } finally {
            setLoading(false);
            closeDialog();
        }
    };

    return (
        <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-4 shadow-xl">
            <div className="space-y-3">
                <span className="mb-1 block text-s font-medium text-slate-600">Supprimer {product?.title}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex gap-2 items-center">
                    <Button disabled={loading} type="button" size="sm" variant="outline" onClick={closeDialog}>
                        Annuler
                    </Button>
                    {!loading && (
                        <Button type="button" size="sm" onClick={onSave}>
                            Confirmer
                        </Button>
                    )}
                    <Spinner className={`ml-2 ${loading ? "visible" : "invisible"}`} />
                </div>
            </div>
        </div>
    );
}
