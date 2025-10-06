import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import useProductStore from "../storeProduct";
import { cssCard } from "../util";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function MetaSeo() {
    const { product } = useShopifyStore();
    const {
        metaTitle,
        setMetaTitle,
        metaDescription,
        setMetaDescription,
        ancreUrl,
        setAncreUrl,
        redirectionUrl,
        setRedirectionUrl,
    } = useProductStore();

    const metaTitleProduct = product?.metafields.nodes.find((mf) => mf.key === "title_tag")?.value;
    const metaDescriptionProduct = product?.metafields.nodes.find((mf) => mf.key === "description_tag")?.value;

    useEffect(() => {
        if (metaTitleProduct) setMetaTitle(metaTitleProduct);
        if (metaDescriptionProduct) setMetaDescription(metaDescriptionProduct);
        if (product?.handle) setAncreUrl(product.handle);
    }, [metaTitleProduct, metaDescriptionProduct, product]);

    if (!product) return null;

    return (
        <Card className={cssCard}>
            <CardContent className="p-0">
                <div className="p-6">
                    <h3 className="m-2 text-sm font-medium flex items-center gap-2">Titre de la page</h3>
                    <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full" />
                    <p className={`text-sm ml-1 mt-1 ${metaTitle.length > 70 ? "text-red-600" : "text-gray-500"}`}>
                        {metaTitle.length} sur 70 caractères utilisés
                    </p>
                </div>
                <div className="p-6">
                    <h3 className="m-2 text-sm font-medium flex items-center gap-2">Méta description</h3>
                    <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                    />{" "}
                    <p className={`text-sm ml-1 ${metaDescription.length > 160 ? "text-red-600" : "text-gray-500"}`}>
                        {metaDescription.length} sur 160 caractères utilisés
                    </p>
                </div>
                <div className="p-6 w-min">
                    <h3 className="m-2 text-sm font-medium flex items-center gap-2">Ancre d'URL</h3>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            /products/
                        </span>
                        <Input value={ancreUrl} onChange={(e) => setAncreUrl(e.target.value)} className="pl-[85px]" />
                    </div>
                    {ancreUrl.trim() !== product.handle && (
                        <div
                            onClick={() => setRedirectionUrl(!redirectionUrl)}
                            className={`
                               w-max flex items-center gap-3 p-1 mt-2 rounded-lg border-2 transition-all cursor-pointer
                                ${
                                    ancreUrl.trim() !== product.handle
                                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }
                            `}
                        >
                            <Checkbox checked={redirectionUrl} className="cursor-pointer" />
                            <Label className="flex-1 cursor-pointer font-medium text-sm h-full">
                                Créer une redirection d’URL : <br /> {product.handle} {" -> "}
                                {ancreUrl}
                            </Label>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
