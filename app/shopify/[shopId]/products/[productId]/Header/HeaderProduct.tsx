"use client";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { Tag } from "lucide-react";
import ActionsHeader from "./ActionsHeader";
import useShopifyStore from "@/components/shopify/shopifyStore";
import OtherShop from "./OtherShop";

/**
 * Header sticky de la page produit
 * Contient le titre, les liens vers les autres boutiques et les actions
 */
export default function HeaderProduct() {
    const { handleCopy } = useCopy();
    const { product, shopifyBoutique } = useShopifyStore();

    if (!product || !shopifyBoutique) return null;

    return (
        <CardHeader className="sticky top-12 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Titre du produit (cliquable pour copier) */}
                <CardTitle
                    onClick={() => handleCopy(product.title)}
                    className="flex items-center gap-2 text-lg font-semibold cursor-pointer group transition-all hover:text-blue-600"
                    title="Cliquer pour copier le titre"
                >
                    <Tag size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="line-clamp-1">{product.title}</span>
                </CardTitle>

                {/* Section centrale : liens autres boutiques */}
                <OtherShop />

                {/* Actions (save, voir, éditer, dupliquer, supprimer) */}
                <ActionsHeader />
            </div>
        </CardHeader>
    );
}
