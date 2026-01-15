"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { ProductGET } from "@/library/types/graph";
import { Check, ExternalLink, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useBulkStore from "./storeBulk";

/**
 * Carte d'un produit dans la vue d'édition en masse
 * Cliquable pour sélectionner/désélectionner
 */
export default function ProductBulk({ product }: { product: ProductGET }) {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { selectedProducts, addProductSelected, removeProductSelected, removeDataUpdate, addDataUpdate } = useBulkStore();
    
    const id = product.id.split("/").pop();
    const url = `/shopify/${shopifyBoutique?.id}/products/${id}`;
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    const variant = product.variants?.nodes[0];

    // Calcul des canaux
    const canaux = canauxBoutique.map((c) => {
        const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        return { id: c.id, isPublished: found?.isPublished ?? false, name: c.name };
    });
    const publishedCount = canaux.filter((c) => c.isPublished).length;

    const handleSelect = (e: React.MouseEvent) => {
        // Ne pas sélectionner si on clique sur un lien
        if ((e.target as HTMLElement).closest("a")) return;

        const dataUpdate = {
            id: product.id,
            canaux: canaux.filter((c) => !c.isPublished),
        };

        if (isSelected) {
            removeProductSelected(product.id);
            removeDataUpdate(product.id);
        } else {
            addProductSelected(product);
            addDataUpdate(dataUpdate);
        }
    };

    // Badge de statut
    const getStatusBadge = () => {
        switch (product.status) {
            case "ACTIVE":
                return "bg-green-100 text-green-700 border-green-200";
            case "DRAFT":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "ARCHIVED":
                return "bg-gray-100 text-gray-600 border-gray-200";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div
            onClick={handleSelect}
            className={`
                group cursor-pointer rounded-xl border-2 transition-all duration-200
                ${isSelected 
                    ? "border-blue-500 bg-blue-50/50 shadow-md" 
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }
            `}
        >
            <div className="flex items-start gap-4 p-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                    <div
                        className={`
                            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                            ${isSelected 
                                ? "bg-blue-500 border-blue-500" 
                                : "border-gray-300 group-hover:border-blue-400"
                            }
                        `}
                    >
                        {isSelected && <Check size={16} className="text-white" />}
                    </div>
                </div>

                {/* Image */}
                <Link href={url} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:border-blue-400 transition-colors">
                        <Image
                            src={product.media?.nodes[0]?.image?.url || "/no_image.png"}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </div>
                </Link>

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <Link 
                                href={url} 
                                className="flex items-center gap-1 group/link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-sm font-semibold text-gray-900 group-hover/link:text-blue-600 line-clamp-1 transition-colors">
                                    {product.title}
                                </h3>
                                <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">{product.vendor}</p>
                        </div>

                        {/* Prix */}
                        <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-bold text-gray-900">
                                {variant?.price}
                                <span className="text-xs font-normal text-gray-500 ml-1">
                                    {shopifyBoutique?.devise}
                                </span>
                            </p>
                            {variant?.compareAtPrice && (
                                <p className="text-xs text-gray-400 line-through">
                                    {variant.compareAtPrice}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tags (max 3) */}
                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {product.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="inline-block bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                            {product.tags.length > 3 && (
                                <span className="inline-block text-gray-400 text-[10px] px-1">
                                    +{product.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Ligne d'infos */}
                    <div className="flex items-center flex-wrap gap-3 mt-3">
                        {/* Statut */}
                        <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge()}`}>
                            {product.status === "ACTIVE" ? "Actif" : product.status === "DRAFT" ? "Brouillon" : "Archivé"}
                        </span>

                        {/* Stock */}
                        <span className={`
                            inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border
                            ${(variant?.inventoryQuantity || 0) > 0 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                        `}>
                            <Package size={10} />
                            {variant?.inventoryQuantity || 0} en stock
                        </span>

                        {/* Canaux publiés */}
                        <span className={`
                            inline-flex text-[10px] px-2 py-0.5 rounded-full border
                            ${publishedCount === canaux.length 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : publishedCount > 0
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                            }
                        `}>
                            {publishedCount}/{canaux.length} canaux
                        </span>

                        {/* SKU */}
                        <span className="text-[10px] text-gray-400 font-mono">
                            SKU: {variant?.sku || "N/A"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
