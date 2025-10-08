import useShopifyStore from "@/components/shopify/shopifyStore";
import Image from "next/image";

export default function AmazonLink() {
    const { product, shopifyBoutique } = useShopifyStore();

    const asin = product?.metafields.nodes.find((mf) => mf.key === "asin");
    if (!product || !shopifyBoutique || !asin) return null;

    return (
        <a href={`https://${shopifyBoutique?.marketplaceAmazon}/dp/${asin?.value}`} target="_blank" rel="noopener noreferrer">
            <Image title="Editer sur Shopify" src="/amazon.png" alt="Flag" width={40} height={40} className="mt-3 object-contain w-auto h-auto" />
        </a>
    );
}
