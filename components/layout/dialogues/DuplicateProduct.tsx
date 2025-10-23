import { duplicateProductSameShop } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Switch } from "@/components/ui/switch";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DuplicateProduct() {
    const { closeDialog, openDialog } = useShopifyStore();
    const [newProductName, setNewProductName] = useState<string>("");
    const [published, setPublished] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const { shopifyBoutique, product } = useShopifyStore();
    const router = useRouter();

    const duplicate = async () => {
        if (!product || !shopifyBoutique || loading) {
            const msg = !product ? "Le produit est introuvable" : "La boutique Shopify n'est pas configurée";
            toast.error(msg);
            return;
        }
        setLoading(true);
        try {
            const data = await duplicateProductSameShop(shopifyBoutique.domain, product.id, newProductName, published);
            if (data.error) toast.error(data.error);
            if (data.message) {
                toast.success(data.message);
                const url = `/product?id=${data.response.id.split("/").pop()}&shopify=${shopifyBoutique.locationHome}`;
                router.push(url);
            }
        } catch (error) {
            toast.error("Une erreur s'est produite lors de la création du produit.");
        } finally {
            setLoading(false);
            closeDialog();
        }
    };

    useKeyboardShortcuts("Enter", () => duplicate());

    return (
        <>
            <X className="absolute right-4 top-4 cursor-pointer" onClick={closeDialog} />
            <div className="space-y-3">
                <span className="mb-1 block text-s font-medium text-slate-600">Dupliquer {product?.title}</span>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-5">
                <div className="flex items-center gap-2 w-full">
                    <Input
                        type="text"
                        placeholder="Nom du nouveau produit"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="flex-1"
                    />
                    <Switch checked={published} onCheckedChange={setPublished} />
                    <p>{published ? "Publié" : "Brouillon"}</p>
                </div>
                <div className="flex gap-2 items-center justify-between">
                    <Button type="button" size="sm" onClick={duplicate} disabled={loading || newProductName.trim() === ""}>
                        Confirmer
                        {loading && <Spinner />}
                    </Button>
                    <Button disabled={loading} type="button" size="sm" variant="outline" onClick={() => openDialog(34)}>
                        Retour
                    </Button>
                </div>
            </div>
        </>
    );
}
