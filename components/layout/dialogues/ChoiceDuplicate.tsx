import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, X } from "lucide-react";

export default function ChoiceDuplicate() {
    const { closeDialog, openDialog } = useShopifyStore();
    const { product } = useShopifyStore();
    return (
        <>
            <X className="absolute right-4 top-4 cursor-pointer" onClick={closeDialog} />
            <div className="space-y-3">
                <span className="mb-1 block text-s font-medium text-slate-600">Dupliquer {product?.title} vers...</span>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-5">
                <div className="flex gap-2 items-center justify-between">
                    <Button variant="outline" type="button" size="sm" onClick={() => openDialog(3)}>
                        Nouveau produit dans cette boutique
                        <Copy className="ml-2" />
                    </Button>{" "}
                    <Button variant="outline" type="button" size="sm" onClick={() => openDialog(4)}>
                        Une ou plusieurs autres boutiques
                        <CopyPlus className="ml-2" />
                    </Button>
                </div>
            </div>
        </>
    );
}
