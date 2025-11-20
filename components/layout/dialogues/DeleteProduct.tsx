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
            const url = `/shopify/${shopifyBoutique.id}/products`;
            router.push(url);
        } catch (error) {
            toast.error("Une erreur s'est produite lors de la création du produit.");
        } finally {
            setLoading(false);
            closeDialog();
        }
    };

    return (
        <div className="relative z-10 w-full bg-white flex flex-col p-6 items-center justify-center gap-6">
            <div className="">
                <span className="mb-1 block text-s font-medium text-slate-600">Supprimer {product?.title}</span>
            </div>

            <div className="flex items-center justify-evenly gap-6">
                <Button disabled={loading} type="button" size="sm" variant="outline" onClick={closeDialog}>
                    Annuler
                </Button>
                {!loading && (
                    <Button type="button" size="sm" onClick={onSave}>
                        Confirmer
                    </Button>
                )}
                {loading && <Spinner className="ml-2" />}
            </div>
        </div>
    );
}
