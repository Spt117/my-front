import useShopifyStore from "@/components/shopify/shopifyStore";
import { BookCopy, Copy, CopyMinusIcon, CopyPlusIcon, Globe } from "lucide-react";
import Image from "next/image";
import AmazonLink from "./AmazonLink";
import Save from "./Save";

export default function ActionsHeader() {
    const { product, shopifyBoutique, openDialog } = useShopifyStore();

    if (!product || !shopifyBoutique) return null;

    const productUrl = `https://${shopifyBoutique.publicDomain}/products/${product.handle}`;
    return (
        <div className="flex gap-2 items-center mr-2">
            <Save />
            <AmazonLink />
            <a href={productUrl} target="_blank" rel="noopener noreferrer">
                <span title="Voir le produit sur la boutique">
                    <Globe size={30} />
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
                    width={30}
                    height={30}
                    className="w-auto h-auto object-cover rounded"
                />
            </a>
            <span title="Dupliquer le produit dans la même boutique" className="ml-1 cursor-pointer">
                <CopyPlusIcon size={35} onClick={() => openDialog(34)} />
            </span>
        </div>
    );
}
