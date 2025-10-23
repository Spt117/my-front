import { brandTypes, TProductType } from "@/components/shopify/ProductType";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { boutiqueFromDomain, boutiques } from "@/params/paramsShopify";
import { IconPoint } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchIdsFromSku } from "../serverAction";
import useProductStore from "../storeProduct";

export default function OtherShop() {
    const { idsOtherShop, setIdsOtherShop } = useProductStore();
    const [loading, setLoading] = useState(false);
    const { openDialog, shopifyBoutique, setSelectedType, setSelectedBrand, product } = useShopifyStore();

    useEffect(() => {
        const brand = brandTypes.find((b) => product?.tags.includes(b));
        if (brand) setSelectedBrand(brand);
        setSelectedType(product?.productType.toLowerCase() as TProductType);
    }, [product?.tags, product?.productType]);

    useEffect(() => {
        const handleGetProductOtherShop = async () => {
            setLoading(true);
            if (!product?.variants || !shopifyBoutique) return;
            const data = await fetchIdsFromSku(shopifyBoutique?.domain, product.variants.nodes[0].sku);
            setIdsOtherShop(data.response || []);
            if (data.error) toast.error(data.error);
            setLoading(false);
        };
        handleGetProductOtherShop();
    }, [shopifyBoutique, product]);

    const otherShop = boutiques.filter(
        (b) =>
            b.domain !== shopifyBoutique?.domain &&
            b.niche === shopifyBoutique?.niche &&
            !idsOtherShop.find((id) => b.domain === id.domain)
    );

    return (
        <div className="flex items-center gap-2 flex-1">
            {loading && <Spinner />}
            {!loading &&
                idsOtherShop.map((id) => {
                    const boutique = boutiqueFromDomain(id.domain);
                    const productId = id.productId.replace("gid://shopify/Product/", "");
                    const url = `/shopify/${boutique.id}/products/${productId}`;
                    return (
                        <Link
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
            {!loading &&
                otherShop.length > 0 &&
                otherShop.map((b) => {
                    const boutique = boutiqueFromDomain(b.domain);
                    return (
                        <span key={b.domain} className="text-sm cursor-pointer relative" onClick={() => openDialog(4)}>
                            <IconPoint className="absolute bottom-0 right-0 text-white bg-red-600 rounded-full" size={10} />
                            <img title={boutique.publicDomain} src={boutique.flag} alt={boutique.langue} width={20} height={20} />
                        </span>
                    );
                })}
        </div>
    );
}
