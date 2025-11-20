import { boutiqueFromDomain, TDomainsShopify } from "@/params/paramsShopify";
import { LineItemNode } from "@/library/shopify/orders";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductSection({ node, domain }: { node: LineItemNode; domain: TDomainsShopify }) {
    const idProduct = node.variant?.product.id.split("/").pop();
    const boutique = boutiqueFromDomain(domain);
    const url = `/shopify/${boutique.id}/products/${idProduct}`;

    if (node.variant)
        return (
            <Link href={url} rel="noopener noreferrer" className="">
                <div className="flex items-center gap-2 border-2 border-gray-200 rounded-md p-1 hover:shadow-md transition-shadow">
                    <div className="relative w-24 h-24 z-0">
                        <Image
                            sizes="50"
                            priority
                            src={node.variant?.product.featuredImage.url || "/no_image.png"}
                            alt={node.title}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{node.title}</p>
                        <p className="text-xs text-gray-500">{`${node.variant.price} ${boutique.devise}`}</p>
                        <p className="text-xs text-gray-500">SKU: {node.sku}</p>
                        {node.quantity === 1 && <p className="text-xs text-gray-500">Quantité: {node.quantity}</p>}
                        {node.quantity > 1 && (
                            <p className="text-sm text-red-500 font-bold flex items-center gap-1">
                                <AlertTriangle />
                                Quantités: {node.quantity}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        );
}
