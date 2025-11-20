import useShopifyStore from "@/components/shopify/shopifyStore";
import { ProductGET } from "@/library/types/graph";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useBulkStore from "./storeBulk";

export default function ProductBulk({ product }: { product: ProductGET }) {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { selectedProducts, addProductSelected, removeProductSelected, removeDataUpdate, addDataUpdate } = useBulkStore();
    const id = product.id.split("/").pop();
    const url = `/shopify/${shopifyBoutique?.id}/products/${id}`;

    const isSelected = selectedProducts.some((p) => p.id === product.id);

    const canaux = canauxBoutique.map((c) => {
        const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
        else return { id: c.id, isPublished: false, name: c.name };
    });
    const canauxP = canaux.filter((c) => c.isPublished);
    const canauxToUpdate = canaux.filter((c) => c.isPublished !== canauxP.find((cp) => cp.id === c.id)?.isPublished);

    const dataUpdate = {
        id: product.id,
        canaux: canauxToUpdate,
    };

    const handleSelect = () => {
        if (isSelected) {
            removeProductSelected(product.id);
            removeDataUpdate(product.id);
        } else {
            addProductSelected(product);
            addDataUpdate(dataUpdate);
        }
    };

    return (
        <div onClick={handleSelect} className="w-full cursor-pointer group">
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-white">
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-1">
                    <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-500"
                        }`}
                    >
                        {isSelected && <Check size={16} className="text-white" />}
                    </div>
                </div>

                {/* Image */}
                <div className="flex-shrink-0">
                    <Link href={url} className="block">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
                            <Image
                                src={product.media.nodes[0].image?.url || "/no_image.png"}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </div>
                    </Link>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <Link href={url}>
                                <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors">
                                    {product.title}
                                </h3>
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">{product.vendor}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-bold text-gray-900">
                                {product.variants?.nodes[0].price}
                                <span className="text-xs font-normal text-gray-600 ml-1">{shopifyBoutique?.devise}</span>
                            </p>
                            {product.variants?.nodes[0].compareAtPrice && (
                                <p className="text-xs text-gray-500 line-through">{product.variants.nodes[0].compareAtPrice}</p>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {product.tags.map((tag, idx) => (
                                <span key={idx} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Status & Channels */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {/* Status Badge */}
                        <span
                            className={`inline-flex text-xs font-medium px-2 py-1 rounded ${
                                product.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : product.status === "DRAFT"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {product.status}
                        </span>

                        {/* Published Channels */}
                        {canaux.length > 0 && (
                            <div className="flex items-center flex-wrap gap-1">
                                {canaux.map((pub, idx) => (
                                    <p
                                        key={idx}
                                        className={`${
                                            pub.isPublished
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-red-50 text-red-700 border-red-200"
                                        } inline-block text-xs px-2 py-0.5 rounded border`}
                                    >
                                        {pub.name}
                                    </p>
                                ))}{" "}
                                <span>{`${canauxToUpdate.length} à mettre à jour`}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>SKU: {product.variants?.nodes[0].sku}</span>
                        <span>Stock: {product.variants?.nodes[0].inventoryQuantity}</span>
                        <span>
                            {product.variants?.nodes.length} variante
                            {product.variants && product.variants.nodes.length > 1 ? "s" : ""} disponibles
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
