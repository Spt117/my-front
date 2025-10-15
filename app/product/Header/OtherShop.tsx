import useShopifyStore from "@/components/shopify/shopifyStore";
import { fetchIdsFromSku } from "../serverAction";
import { useEffect, useState } from "react";
import { boutiqueFromDomain, TDomainsShopify } from "@/library/params/paramsShopify";
import Link from "next/link";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function OtherShop() {
    const { shopifyBoutique, setShopifyBoutique, product } = useShopifyStore();
    const [ids, setIds] = useState<{ domain: TDomainsShopify; variantId: string; productId: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleGetProductOtherShop = async () => {
            setLoading(true);
            if (!product?.variants || !shopifyBoutique) return;
            const data = await fetchIdsFromSku(shopifyBoutique?.domain, product.variants.nodes[0].sku);
            setIds(data.response || []);
            if (data.error) toast.error(data.error);
            setLoading(false);
        };
        handleGetProductOtherShop();
    }, [shopifyBoutique, product]);

    return (
        <div className="flex items-center gap-2 flex-1">
            {loading && <Spinner />}
            {!loading &&
                ids.map((id) => {
                    const boutique = boutiqueFromDomain(id.domain);
                    const productId = id.productId.replace("gid://shopify/Product/", "");
                    const handleClic = () => {
                        setShopifyBoutique(boutique);
                    };
                    const url = `/product?id=${productId}&shopify=${boutique.locationHome}`;
                    return (
                        <Link
                            onClick={handleClic}
                            key={id.productId}
                            href={url}
                            rel="noopener noreferrer"
                            title={`Voir le produit dans la boutique ${boutique.publicDomain}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <span className="text-xs">
                                <img title={boutique.langue} src={boutique.flag} alt={boutique.langue} width={20} height={20} />
                            </span>
                        </Link>
                    );
                })}
        </div>
    );
}
