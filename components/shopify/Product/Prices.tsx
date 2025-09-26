import { Button } from "@/components/ui/button";
import useShopifyStore from "../shopifyStore";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import { DollarSign, Tag, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-label";

export default function Prices() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [price, setPrice] = useState(product?.variants.nodes[0].price);
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const [isUpdatingComparePrice, setIsUpdatingComparePrice] = useState(false);
    const [compareAtPrice, setCompareAtPrice] = useState(product?.variants.nodes[0].compareAtPrice || "");
    if (!product || !shopifyBoutique) return null;

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
        console.log("Update price to:", price);
    };

    const handleUpdateCompareAtPrice = async () => {
        console.log("Update compare at price to:", compareAtPrice);
    };

    const isPriceChanged = price !== mainVariant.price;
    const isCompareAtPriceChanged = compareAtPrice !== (mainVariant.compareAtPrice || "");
    const discount = compareAtPrice && price ? Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100) : 0;

    return (
        <Card className="mx-auto shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
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
                                <Input id="price" type="number" step="0.1" value={price} onChange={(e) => setPrice(e.target.value)} className="pr-8 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" />
                                <span className="absolute bottom-2 right-2 text-slate-500 text-sm font-medium">{shopifyBoutique.devise}</span>
                            </div>
                        </div>

                        <Button onClick={handleUpdatePrice} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 min-w-[100px]">
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
                                    value={compareAtPrice}
                                    onChange={(e) => setCompareAtPrice(e.target.value)}
                                    placeholder="Prix de comparaison"
                                    className="pr-8 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="absolute bottom-2 right-2 text-slate-500 text-sm font-medium">{shopifyBoutique.devise}</span>
                            </div>
                        </div>

                        <Button onClick={handleUpdateCompareAtPrice} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 min-w-[100px]">
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
