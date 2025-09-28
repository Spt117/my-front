import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { postServer } from "@/library/utils/fetchServer";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-select";
import { Check, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useShopifyStore from "../../components/shopify/shopifyStore";

export default function Prices() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [price, setPrice] = useState("0");
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const [isUpdatingComparePrice, setIsUpdatingComparePrice] = useState(false);
    const [compareAtPrice, setCompareAtPrice] = useState("0");
    if (!product || !shopifyBoutique) return null;
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPrice(product?.variants.nodes[0].price);
        setCompareAtPrice(product?.variants.nodes[0].compareAtPrice || "0");
    }, [product.variants.nodes[0].price, product.variants.nodes[0].compareAtPrice]);

    const inputNumberStyle = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

    const mainVariant = product.variants.nodes[0];

    const handleUpdatePrice = async () => {
        setIsUpdatingPrice(true);
        const url = "http://localhost:9100/shopify/update-price";
        const data = {
            domain: shopifyBoutique.domain,
            productId: product.id,
            variantId: mainVariant.id,
            price: Number(price),
        };
        try {
            const res = await postServer(url, data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du prix");
        } finally {
            if (ref.current) ref.current.value = "";
            setIsUpdatingPrice(false);
        }
    };

    const handleUpdateCompareAtPrice = async () => {
        setIsUpdatingComparePrice(true);
        const url = "http://localhost:9100/shopify/update-compare-at-price";
        const data = {
            domain: shopifyBoutique.domain,
            productId: product.id,
            variantId: mainVariant.id,
            compareAtPrice: Number(compareAtPrice),
        };
        try {
            const res = await postServer(url, data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du prix barré");
        } finally {
            if (ref.current) ref.current.value = "";
            setIsUpdatingComparePrice(false);
        }
    };

    const isPriceChanged = price !== mainVariant.price;
    const isCompareAtPriceChanged = compareAtPrice !== (mainVariant.compareAtPrice || "0");
    const discount =
        compareAtPrice && price
            ? Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)
            : 0;

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white w-min h-min">
            <style dangerouslySetInnerHTML={{ __html: inputNumberStyle }} />

            <CardContent className="space-y-6">
                {/* Prix principal */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="price" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Prix de vente
                        </Label>
                        {/* {isPriceChanged && ( */}
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            Modifié
                        </Badge>
                        {/* )} */}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <div className="relative w-fit">
                                <Input
                                    ref={ref}
                                    id="price"
                                    type="number"
                                    step="0.1"
                                    placeholder={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="pr-8 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="absolute bottom-2 right-2 text-slate-500 text-sm font-medium">
                                    {shopifyBoutique.devise}
                                </span>
                            </div>
                        </div>

                        <Button
                            disabled={!isPriceChanged}
                            onClick={handleUpdatePrice}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 min-w-[150px]"
                        >
                            {isUpdatingPrice ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs">Mise à jour...</span>
                                </div>
                            ) : isPriceChanged ? (
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs">Mettre à jour</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <X className="h-4 w-4" />
                                    <span className="text-xs">À jour</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                <Separator className="bg-slate-200" />

                {/* Prix barré */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="comparePrice" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Prix barré
                        </Label>
                        <div className="flex items-center gap-2">
                            {isCompareAtPriceChanged && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Modifié
                                </Badge>
                            )}
                            {discount > 0 && (
                                <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                                    -{discount}%
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <div className="relative w-fit">
                                <Input
                                    id="comparePrice"
                                    type="number"
                                    min={product.variants.nodes[0].price}
                                    placeholder={compareAtPrice}
                                    onChange={(e) => setCompareAtPrice(e.target.value)}
                                    className="pr-8 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="absolute bottom-2 right-2 text-slate-500 text-sm font-medium">
                                    {shopifyBoutique.devise}
                                </span>
                            </div>
                        </div>

                        <Button
                            disabled={!isCompareAtPriceChanged}
                            onClick={handleUpdateCompareAtPrice}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 min-w-[150px]"
                        >
                            {isUpdatingComparePrice ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs">Mise à jour...</span>
                                </div>
                            ) : isCompareAtPriceChanged ? (
                                <div className="flex items-center gap-1">
                                    <Check className="h-4 w-4" />
                                    <span className="text-xs">Mettre à jour</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <X className="h-4 w-4" />
                                    <span className="text-xs">À jour</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Résumé visuel */}
                {compareAtPrice && price && (
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Économie client</span>
                            <div className="flex items-center gap-2">
                                <span className="line-through text-slate-400">
                                    {compareAtPrice}
                                    {shopifyBoutique.devise}
                                </span>
                                <span className="font-semibold text-emerald-700">
                                    {price}
                                    {shopifyBoutique.devise}
                                </span>
                                <Badge variant="destructive" className="bg-red-100 text-red-700">
                                    -{(parseFloat(compareAtPrice) - parseFloat(price)).toFixed(2)}
                                    {shopifyBoutique.devise}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
