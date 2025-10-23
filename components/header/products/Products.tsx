"use client";
import { ProductGET } from "@/library/types/graph";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import useShopifyStore from "../../shopify/shopifyStore";
import { useRouter } from "next/navigation";

export default function ProductList({ product }: { product: ProductGET }) {
    const { shopifyBoutique, setSearchTerm } = useShopifyStore();
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    if (!shopifyBoutique) return;
    const id = product.id.split("/").pop();
    const url = `/shopify/25754107976/products/${id}`;
    const productUrl = `https://${shopifyBoutique.publicDomain}/products/${product.handle}`;

    const handleClick = () => {
        setSearchTerm("");
        router.push(url);
    };

    return (
        <div className="flex items-center hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm pr-2" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div onClick={handleClick} className="w-full">
                <div className="cursor-pointer flex items-center py-3 px-4 jsustify-start gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image src={product.images.nodes[0]?.url || "/no_image.png"} alt={product.title} fill className="object-cover rounded-md" sizes="48px" priority={false} />
                    </div>
                    <h3 className="w-1/4 text-sm font-medium text-foreground line-clamp-1">{product.title}</h3>
                    <div className="w-1/4 text-sm text-primary">{`${product.variants?.nodes[0]?.price} ${shopifyBoutique?.devise}`}</div>
                    <div className="w-1/4 text-sm text-primary">{`${product.productType} `}</div>
                    <a onClick={(e) => e.stopPropagation()} href={productUrl} className="p-1 hover:bg-gray-200 rounded-md right-3 absolute" target="_blank" rel="noopener noreferrer">
                        <span title="Afficher sur votre boutique" className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                            <Eye size={20} color={isHovered ? "currentColor" : "transparent"} />
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
