import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { TVariant } from "@/library/models/produits/Variant";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { Copy } from "lucide-react";
import Amazon from "./Metafields/Amazon";

export default function LinkToShops({ variant }: { variant: TVariant | null }) {
    if (!variant) return null;
    const { handleCopy } = useCopy();
    const shopifyUrls = variant.ids.map((d) => {
        const boutique = boutiqueFromDomain(d.shop);
        const data = {
            urlShopify: `https://${d.shop}/admin/products/${d.idProduct?.replace("gid://shopify/Product/", "")}`,
            nameShop: boutique.vendor,
            flag: boutique.flag,
            idProduct: d.idProduct,
            idVariant: d.idVariant,
        };
        return data;
    });
    const classCopy = "cursor-pointer transition-transform duration-500 ease-out active:scale-93";

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="flex justify-between flex-wrap gap-4">
                <div className="flex flex-col gap-4">
                    {shopifyUrls.map((d, index) => (
                        <div key={index} className="flex flex-col gap-1">
                            <a key={d.nameShop} href={d.urlShopify} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center space-x-1">
                                <img src={d.flag} alt={d.nameShop} className="w-5 h-5 rounded-full" />
                                <span className="text-sm">{d.nameShop}</span>
                            </a>

                            <p className={"flex items-center gap-1 text-gray-700 m-0 p-0" + classCopy} onClick={() => handleCopy(d.idProduct)}>
                                IdProduct: {d.idProduct}
                                <Copy size={12} className="text-gray-500" />
                            </p>
                            <p className={"flex items-center gap-1 text-gray-700 " + classCopy} onClick={() => handleCopy(d.idVariant)}>
                                IdVariant: {d.idVariant}
                                <Copy size={12} className="text-gray-500" />
                            </p>
                        </div>
                    ))}
                </div>
                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <p className={"flex items-center gap-1 text-gray-700 " + classCopy} onClick={() => handleCopy(variant.sku)} title="Cliquer pour copier le SKU">
                        SKU: {variant.sku}
                        <Copy size={12} className="text-gray-500" />
                    </p>
                    <p className={"flex items-center gap-1 text-gray-700 " + classCopy} onClick={() => handleCopy(variant.barcode || "Non disponible", "Barcode copié !")}>
                        Barcode: {variant?.barcode || "Non disponible"}
                        <Copy size={12} className="text-gray-500" />
                    </p>

                    <Amazon />
                </div>
            </CardContent>
        </Card>
    );
}
