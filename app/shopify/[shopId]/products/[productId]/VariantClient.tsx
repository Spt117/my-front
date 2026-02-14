"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Box,
    ChevronDown,
    ChevronUp,
    Package,
    ShieldCheck,
    Truck,
} from "lucide-react";
import { useState } from "react";
import { cssCard } from "./util";
import StockAdjust from "./variant/StockAdjust";

export default function VariantClient() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [showDetails, setShowDetails] = useState(false);

    if (!product || !shopifyBoutique) return null;

    const variant = product.variants?.nodes[0];
    if (!variant) return null;

    const quantity = variant.inventoryQuantity;
    const isTracked = variant.inventoryItem?.tracked;
    const requiresShipping = variant.inventoryItem?.requiresShipping;
    const inventoryPolicy = variant.inventoryPolicy;
    const selectedOptions = variant.selectedOptions;
    const weight = variant.inventoryItem?.measurement?.weight;

    // Status du stock
    const isOutOfStock = quantity <= 0;
    const isLowStock = quantity > 0 && quantity <= 5;

    const stockBadgeClass = isOutOfStock
        ? "bg-red-50 text-red-700 border-red-200"
        : isLowStock
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";

    const stockLabel = isOutOfStock
        ? "Rupture"
        : isLowStock
          ? "Stock faible"
          : "En stock";

    const stockDotClass = isOutOfStock
        ? "bg-red-500"
        : isLowStock
          ? "bg-amber-500"
          : "bg-emerald-500";

    const stockRingClass = isOutOfStock
        ? "ring-red-200"
        : isLowStock
          ? "ring-amber-200"
          : "ring-emerald-200";

    // Options significatives (pas "Default Title")
    const meaningfulOptions = selectedOptions?.filter(
        (opt) => opt.value !== "Default Title"
    );

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-5">
                {/* === Header === */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                        <Package size={16} />
                        Inventaire
                    </h3>
                    {isTracked && (
                        <Badge
                            variant="outline"
                            className="text-xs font-medium gap-1 text-gray-500"
                        >
                            <ShieldCheck size={12} />
                            Suivi activé
                        </Badge>
                    )}
                </div>

                {/* === Stock actuel === */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${stockDotClass} ring-2 ring-offset-1 ${stockRingClass}`}
                            />
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Stock disponible
                                </p>
                                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                                    {quantity}
                                    <span className="text-sm font-normal text-gray-400 ml-1">
                                        unité{quantity !== 1 ? "s" : ""}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${stockBadgeClass}`}
                        >
                            {stockLabel}
                        </span>
                    </div>
                </div>

                {/* === Ajustement du stock (client) === */}
                <StockAdjust
                    domain={shopifyBoutique.domain}
                    variantGid={variant.id}
                    quantity={quantity}
                />

                {/* === Séparateur === */}
                <div className="border-t border-gray-100" />

                {/* === Détails (collapsible) === */}
                <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <span className="font-medium">
                        Détails de la variante
                    </span>
                    {showDetails ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </button>

                {showDetails && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Politique d'inventaire */}
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/80 border border-gray-100">
                            <div className="flex items-center gap-2">
                                <Box size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Politique d&apos;inventaire
                                </span>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-xs ${
                                    inventoryPolicy === "CONTINUE"
                                        ? "text-blue-600 border-blue-200 bg-blue-50"
                                        : "text-gray-600 border-gray-200 bg-gray-50"
                                }`}
                            >
                                {inventoryPolicy === "CONTINUE"
                                    ? "Continuer la vente"
                                    : "Arrêter à 0"}
                            </Badge>
                        </div>

                        {/* Expédition */}
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/80 border border-gray-100">
                            <div className="flex items-center gap-2">
                                <Truck size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Expédition requise
                                </span>
                            </div>
                            <span
                                className={`text-sm font-medium ${requiresShipping ? "text-emerald-600" : "text-gray-400"}`}
                            >
                                {requiresShipping ? "Oui" : "Non"}
                            </span>
                        </div>

                        {/* Poids */}
                        {weight && weight.value > 0 && (
                            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/80 border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Package
                                        size={14}
                                        className="text-gray-400"
                                    />
                                    <span className="text-sm text-gray-600">
                                        Poids
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 tabular-nums">
                                    {weight.value}{" "}
                                    {weight.unit === "GRAMS"
                                        ? "g"
                                        : weight.unit === "KILOGRAMS"
                                          ? "kg"
                                          : weight.unit === "OUNCES"
                                            ? "oz"
                                            : "lb"}
                                </span>
                            </div>
                        )}

                        {/* Options de la variante */}
                        {meaningfulOptions && meaningfulOptions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                    Options
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {meaningfulOptions.map((opt) => (
                                        <div
                                            key={opt.name}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100"
                                        >
                                            <span className="text-xs text-indigo-400 font-medium">
                                                {opt.name}
                                            </span>
                                            <span className="text-xs font-semibold text-indigo-700">
                                                {opt.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
