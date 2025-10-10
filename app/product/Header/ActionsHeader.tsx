import useShopifyStore from "@/components/shopify/shopifyStore";
import { BookCopy, Globe } from "lucide-react";
import Image from "next/image";
import AmazonLink from "./AmazonLink";
import Save from "./Save";

export default function ActionsHeader() {
    const { product, shopifyBoutique, openDialog } = useShopifyStore();

    if (!product || !shopifyBoutique) return null;

    const productUrl = `https://${shopifyBoutique.domain}/products/${product.handle}`;
    return (
        <div className="flex gap-2 items-center mr-2">
            <Save />
            <AmazonLink />
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
            <span title="Dupliquer le produit dans la même boutique" className="ml-1 cursor-pointer">
                <BookCopy size={35} onClick={() => openDialog(3)} />
            </span>
        </div>
    );
}
