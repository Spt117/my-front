"use client";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Copy } from "lucide-react";
import useShopifyStore from "../shopifyStore";

export default function HeaderProduct() {
    const { handleCopy } = useCopy();
    const { product, shopifyBoutique } = useShopifyStore();
    if (!product || !shopifyBoutique) return null;

    const productUrl = `https://${shopifyBoutique.domain}/products/${product.handle}`;

    return (
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle
                    onClick={() => {
                        handleCopy(product.title);
                    }}
                    className="flex items-center gap-2 text-lg font-semibold cursor-pointer transition-transform duration-500 ease-out active:scale-85"
                    title="Cliquer pour copier le titre"
                >
                    {product.title}
                    <Copy size={18} className={`text-gray-500`} />
                </CardTitle>
                <div className="flex gap-2">
                    <a href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        <Button className="hover:bg-gray-600">Edit in Shopify</Button>
                    </a>
                    <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        <Button className="hover:bg-gray-600">Aperçu</Button>
                    </a>
                </div>
            </div>
            <div className="text-sm text-muted-foreground">
                Vendu par {product.vendor} | Catégorie: {product.category?.name || "Non spécifié"}
            </div>
        </CardHeader>
    );
}
