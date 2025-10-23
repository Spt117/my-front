"use client";

import useProductStore from "@/app/shopify/[shopId]/products/[productId]/storeProduct";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { boutiqueFromDomain, boutiques, TDomainsShopify } from "@/params/paramsShopify";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import useOrdersStore from "../shopify/orders/store";
import useShopifyStore from "../shopify/shopifyStore";
import SelectFull from "./SelectFull";

export default function ShopifySelect() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product, setSearchTerm } = useShopifyStore();
    const { setFilterOrders, orders } = useOrdersStore();
    const { setPrice, setCompareAtPrice } = useProductStore();
    const path = usePathname();
    const router = useRouter();

    const option2 = boutiques.map((boutique) => ({
        label: (
            <>
                <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                {boutique.vendor}
            </>
        ),
        value: boutique.domain,
    }));

    const handleSelectOrigin = (domain: TDomainsShopify) => {
        const boutique = boutiqueFromDomain(domain);
        if (product) {
            setProduct(null);
        }
        if (path.includes("orders")) {
            router.push(`/shopify/${boutique.id}/orders`);
            return;
        }
        router.push(`/shopify/${boutique.id}`);
    };

    const handleEscape = () => {
        setSearchTerm("");
        if (path.includes("orders")) {
            setShopifyBoutique(null);
            router.push(`/shopify/orders`);
        } else if (path !== "/product") {
            setShopifyBoutique(null);
        } else if (product) {
            setPrice(product?.variants?.nodes[0].price ?? "0");
            setCompareAtPrice(product?.variants?.nodes[0].compareAtPrice || "0");
        }
    };
    useKeyboardShortcuts("Escape", handleEscape);

    return (
        <div className="">
            <Selecteur
                className="xl:hidden"
                array={option2}
                value={shopifyBoutique?.domain || ""}
                onChange={handleSelectOrigin}
                placeholder="Choisir l'origine"
            />
            <SelectFull handleSelectOrigin={handleSelectOrigin} />
        </div>
    );
}
