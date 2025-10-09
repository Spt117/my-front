import { Globe } from "lucide-react";
import Save from "./Save";
import Image from "next/image";
import useShopifyStore from "@/components/shopify/shopifyStore";
import AmazonLink from "./AmazonLink";

export default function ActionsHeader() {
    const { product, shopifyBoutique } = useShopifyStore();

    if (!product || !shopifyBoutique) return null;

    const productUrl = `https://${shopifyBoutique.domain}/products/${product.handle}`;
    return (
        <div className="flex gap-2 items-center mr-2">
            <Save />
            <a href={productUrl} target="_blank" rel="noopener noreferrer">
                <span title="Voir le produit sur la boutique">
                    <Globe size={33} className="ml-2" />
                </span>
            </a>
            <a
                href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    title="Editer sur Shopify"
                    src="/shopify.png"
                    alt="Flag"
                    width={25}
                    height={25}
                    className="ml-2 object-contain w-auto h-auto"
                />
            </a>
            <AmazonLink />
        </div>
    );
}
