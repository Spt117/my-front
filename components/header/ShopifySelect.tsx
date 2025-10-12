"use client";

import useProductStore from "@/app/product/storeProduct";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { boutiqueFromDomain, boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useOrdersStore from "../shopify/orders/store";
import { getCanauxPublication } from "../shopify/serverActions";
import useShopifyStore from "../shopify/shopifyStore";
import SelectFull from "./SelectFull";
import { TCanal } from "@/app/product/util";

export default function ShopifySelect() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product, setSearchTerm, setCanauxBoutique } = useShopifyStore();
    const { setFilterOrders, orders } = useOrdersStore();
    const { setPrice, setCompareAtPrice } = useProductStore();
    const path = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchCanaux = async () => {
            if (!shopifyBoutique) return;
            const canauxPublication = await getCanauxPublication(shopifyBoutique.domain);
            const data: TCanal[] = canauxPublication.map((c) => {
                return { ...c, isPublished: false };
            });
            setCanauxBoutique(data);
        };
        fetchCanaux();
    }, [shopifyBoutique]);

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
        setShopifyBoutique(boutique);
        if (product) {
            setProduct(null);
            router.push("/product");
        }
    };

    const handleEscape = () => {
        setSearchTerm("");
        if (path !== "/product") {
            setShopifyBoutique(null);
            setFilterOrders(orders);
        } else if (product) {
            setPrice(product?.variants.nodes[0].price);
            setCompareAtPrice(product?.variants.nodes[0].compareAtPrice || "0");
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
            <SelectFull />
        </div>
    );
}
