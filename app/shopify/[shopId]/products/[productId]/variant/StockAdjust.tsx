"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { TDomainsShopify } from "@/params/paramsShopifyTypes";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateVariantStock } from "../serverAction";

interface StockAdjustProps {
    domain: TDomainsShopify;
    variantGid: string;
    quantity: number;
}

export default function StockAdjust({ domain, variantGid, quantity }: StockAdjustProps) {
    const [stockAdjust, setStockAdjust] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const newQuantity = quantity + stockAdjust;

    const handleStockUpdate = async () => {
        if (stockAdjust === 0) return;
        setIsUpdating(true);
        try {
            const res = await updateVariantStock(domain, variantGid, newQuantity);
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success(`Stock mis à jour : ${quantity} → ${newQuantity}`);
            }
        } catch {
            toast.error("Erreur lors de la mise à jour du stock");
        } finally {
            setIsUpdating(false);
            setStockAdjust(0);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Ajuster le stock
            </p>
            <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                    <button
                        type="button"
                        onClick={() => setStockAdjust((prev) => prev - 1)}
                        className="flex items-center justify-center w-9 h-9 bg-white text-gray-600 hover:bg-gray-50 transition-colors active:scale-95 border-r border-gray-200"
                    >
                        <Minus size={14} />
                    </button>
                    <Input
                        type="number"
                        value={stockAdjust}
                        onChange={(e) => setStockAdjust(Number(e.target.value))}
                        className="w-16 h-9 text-center bg-white border-0 rounded-none font-semibold tabular-nums shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        type="button"
                        onClick={() => setStockAdjust((prev) => prev + 1)}
                        className="flex items-center justify-center w-9 h-9 bg-white text-gray-600 hover:bg-gray-50 transition-colors active:scale-95 border-l border-gray-200"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <Button
                    disabled={stockAdjust === 0 || isUpdating}
                    onClick={handleStockUpdate}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 shrink-0 transition-colors"
                >
                    {isUpdating ? (
                        <Spinner size={16} className="text-white" />
                    ) : (
                        "Appliquer"
                    )}
                </Button>
            </div>

            {/* Preview du nouveau stock */}
            {stockAdjust !== 0 && (
                <div className="flex items-center gap-2 text-sm px-1">
                    <span className="text-gray-400">{quantity}</span>
                    <span className="text-gray-300">→</span>
                    <span
                        className={`font-semibold tabular-nums ${
                            newQuantity < 0
                                ? "text-red-600"
                                : newQuantity === 0
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                        }`}
                    >
                        {newQuantity}
                    </span>
                    <span className={`text-xs ${stockAdjust > 0 ? "text-emerald-500" : "text-red-500"}`}>
                        ({stockAdjust > 0 ? "+" : ""}{stockAdjust})
                    </span>
                </div>
            )}
        </div>
    );
}
