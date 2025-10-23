import { createProductFromTitle } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AddProduct() {
    const { closeDialog } = useShopifyStore();

    const [title, setTitle] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { shopifyBoutique } = useShopifyStore();
    const router = useRouter();

    const onSave = async () => {
        if (!title.trim() || !shopifyBoutique || loading) {
            const msg = !title.trim() ? "Le titre est requis" : "La boutique Shopify n'est pas configurée";
            toast.error(msg);
            return;
        }
        setLoading(true);
        try {
            const data = await createProductFromTitle(shopifyBoutique.domain, title);
            if (data.error) toast.error(data.error);
            if (data.message) toast.success(data.message);
            const id = data.response.id;
            const url = `/product?id=${id.replace("gid://shopify/Product/", "")}&shopify=${shopifyBoutique.locationHome}`;
            router.push(url);
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
                <label className="block">
                    <span className="mb-1 block text-s font-medium text-slate-600">Titre</span>
                    <input
                        autoFocus
                        type="text"
                        inputMode="text"
                        placeholder="Nom du produit"
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex gap-2 items-center">
                    <Button disabled={loading} type="button" size="sm" variant="outline" onClick={closeDialog}>
                        Annuler
                    </Button>
                    {!loading && (
                        <Button type="button" size="sm" onClick={onSave}>
                            Enregistrer
                        </Button>
                    )}
                    <Spinner className={`ml-2 ${loading ? "visible" : "invisible"}`} />
                </div>
            </div>
        </div>
    );
}
