"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { postServer } from "@/library/utils/fetchServer";
import { useState, useCallback, useMemo } from "react";
import { ImageIcon } from "lucide-react"; // si tu n'as pas Amazon, remplace par un autre icône
import { addImagesFromAsin } from "../serverAction";
import { useRouter } from "next/navigation";

type AmazonImage = {
    url: string;
    name?: string;
    altText?: string;
};

export default function AddFromAsin() {
    const { product, shopifyBoutique } = useShopifyStore();
    const router = useRouter();
    const [asin, setAsin] = useState("");
    const [countryCode, setCountryCode] = useState<"FR" | "US" | "DE" | "UK">("FR");
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<AmazonImage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleImportImagesToShopify = async () => {
        if (!shopifyBoutique || !product) return;
        setLoading(true);
        await addImagesFromAsin(shopifyBoutique.domain, product.id, asin);
        setLoading(false);
        router.refresh();
    };

    if (!product) {
        return <div className="mx-4 my-8 p-4 border rounded-lg text-center text-gray-500">Aucun produit sélectionné</div>;
    }

    return (
        <div className="mx-4 p-4 border border-gray-500 rounded-lg flex-1 h-min space-y-4">
            <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Ajouter des images depuis un ASIN
            </h3>

            <div className="flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                    <Input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="ASIN Amazon (ex : B0CXXXXXXX)" className="flex-1 min-w-[180px]" />
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value as any)} className="border rounded-md px-2 py-1 text-sm">
                        <option value="FR">amazon.fr</option>
                        <option value="US">amazon.com</option>
                        <option value="DE">amazon.de</option>
                        <option value="UK">amazon.co.uk</option>
                    </select>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button disabled={!asin || loading} onClick={handleImportImagesToShopify}>
                        {loading ? (
                            <>
                                <Spinner className="mr-2" />
                                Import en cours...
                            </>
                        ) : (
                            `Importer ${images.length} image${images.length > 1 ? "s" : ""} vers Shopify`
                        )}
                    </Button>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {images.map((img, index) => (
                        <div key={index} className="border rounded-md p-2 flex flex-col gap-1 items-center text-center">
                            <div className="w-24 h-24 border rounded-md overflow-hidden bg-white flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt={img.altText || img.name || "aperçu"} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-xs text-gray-600 break-all">{img.name || `Image ${index + 1}`}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
