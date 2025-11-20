import { createCollection } from "@/app/shopify/[shopId]/collections/server";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AddCollection() {
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
            const data = await createCollection(title, shopifyBoutique.domain);
            if (data.error) toast.error(data.error);
            if (data.message) toast.success(data.message);
            const id = data.response.replace("gid://shopify/Collection/", "");
            const url = `/shopify/${shopifyBoutique.id}/collections/${id}`;
            router.push(url);
        } catch (error) {
            toast.error("Une erreur s'est produite lors de la création de la collection.");
        } finally {
            setLoading(false);
            closeDialog();
        }
    };

    return (
        <>
            <div className="space-y-3">
                <label className="block">
                    <span className="mb-1 block text-s font-medium text-slate-600">Titre</span>
                    <input
                        autoFocus
                        type="text"
                        inputMode="text"
                        placeholder="Nom de la collection"
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
        </>
    );
}
