"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { Copy } from "lucide-react";
import useShopifyStore from "../shopifyStore";
import { cssCard } from "@/app/product/util";

export default function LinkToShops() {
    const { variant } = useShopifyStore();
    const { handleCopy } = useCopy();

    const shopifyUrls = variant?.ids.map((d) => {
        const boutique = boutiqueFromDomain(d.shop);
        return {
            urlShopify: `https://${d.shop}/admin/products/${d.idProduct?.replace("gid://shopify/Product/", "")}`,
            nameShop: boutique.vendor,
            flag: boutique.flag,
            idProduct: d.idProduct,
            idVariant: d.idVariant,
            shop: d.shop,
        };
    });

    // Parents flex items MUST have min-w-0 to allow children to shrink + truncate.
    const classCopy = "flex items-center gap-1 w-full min-w-0"; // <= key

    // The container that holds the long id must be allowed to shrink and hide overflow.
    const classIds = "flex items-center gap-1 font-mono text-xs text-gray-600 ml-1 cursor-pointer transition-transform duration-500 ease-out active:scale-93 flex-1 min-w-0 overflow-hidden"; // <= key

    // The span that contains the id text should truncate.
    const classIdText = "truncate"; // includes overflow-hidden + text-ellipsis + whitespace-nowrap

    if (!variant) return null;
    return (
        <Card className={cssCard}>
            <CardContent className="flex flex-col justify-between h-full gap-4 w-full min-w-0">
                {shopifyUrls?.map((d, index) => (
                    <div key={`${d.shop}-${index}`} className="flex flex-col gap-2 w-full min-w-0">
                        <a href={d.urlShopify} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-2 w-fit">
                            <img src={d.flag} alt={d.nameShop} className="w-5 h-5 rounded-full flex-shrink-0" />
                            <span className="text-sm">{d.nameShop}</span>
                        </a>

                        <p className={classCopy} onClick={() => handleCopy(d.idProduct)}>
                            <span className="flex-shrink-0">IdProduct:</span>
                            <span className={classIds}>
                                <span className={classIdText}>{d.idProduct}</span>
                                <Copy size={12} className="flex-shrink-0" />
                            </span>
                        </p>

                        <p className={classCopy} onClick={() => handleCopy(d.idVariant)}>
                            <span className="flex-shrink-0">IdVariant:</span>
                            <span className={classIds}>
                                <span className={classIdText}>{d.idVariant}</span>
                                <Copy size={12} className="flex-shrink-0" />
                            </span>
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
