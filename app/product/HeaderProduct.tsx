"use client";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Tag } from "lucide-react";
import useShopifyStore from "../../components/shopify/shopifyStore";
import useEditorHtmlStore from "@/components/editeurHtml/storeEditor";
import { saveDescriptionProduct } from "./serverAction";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { formatHTML } from "@/components/editeurHtml/utils";

export default function HeaderProduct() {
    const { handleCopy } = useCopy();
    const { product, shopifyBoutique, loading, setLoading } = useShopifyStore();
    const { hasChanges, modifiedHtml } = useEditorHtmlStore();

    if (!product || !shopifyBoutique) return null;

    const productUrl = `https://${shopifyBoutique.domain}/products/${product.handle}`;

    const handleSave = async () => {
        setLoading(true);
        if (hasChanges) {
            try {
                const descriptionHtml = formatHTML(modifiedHtml);
                const res = await saveDescriptionProduct(shopifyBoutique.domain, product.id, descriptionHtml);
                if (res.error) toast.error("Erreur lors de la sauvegarde");
                if (res.message) toast.success("Description sauvegardée");
            } catch (err) {
                toast.error("Erreur lors de la sauvegarde");
            }
        }
        setLoading(false);
    };

    return (
        <CardHeader className="sticky top-12 w-full z-10 p-1 bg-gray-50 ">
            <div className="flex items-center justify-between">
                <CardTitle
                    onClick={() => {
                        handleCopy(product.title);
                    }}
                    className="flex items-center gap-2 text-lg font-semibold cursor-pointer transition-transform duration-500 ease-out active:scale-85"
                    title="Cliquer pour copier le titre"
                >
                    <Tag size={18} className={`text-gray-500`} />
                    {product.title}
                </CardTitle>
                <div className="flex gap-2">
                    <Button disabled={!hasChanges || loading} className="hover:bg-gray-600" onClick={handleSave}>
                        Save
                        {loading && <Spinner className="ml-2" />}
                    </Button>

                    <a href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        <Button className="hover:bg-gray-600">Edit in Shopify</Button>
                    </a>
                    <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        <Button className="hover:bg-gray-600">Aperçu</Button>
                    </a>
                </div>
            </div>
        </CardHeader>
    );
}
