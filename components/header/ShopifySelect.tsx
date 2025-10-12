"use client";

import useProductStore from "@/app/product/storeProduct";
import { TCanal } from "@/app/product/util";
import Selecteur from "@/components/selecteur";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { boutiqueFromDomain, boutiques, TDomainsShopify } from "@/library/params/paramsShopify";
import useUserStore from "@/library/stores/storeUser";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useOrdersStore from "../shopify/orders/store";
import { CanauxPublication, getDataBoutique } from "../shopify/serverActions";
import useShopifyStore from "../shopify/shopifyStore";
import SelectFull from "./SelectFull";

export default function ShopifySelect() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product, setSearchTerm, setCanauxBoutique } = useShopifyStore();
    const { setFilterOrders, orders } = useOrdersStore();
    const { setPrice, setCompareAtPrice } = useProductStore();
    const path = usePathname();
    const router = useRouter();
    const { socket } = useUserStore();

    useEffect(() => {
        const fetchCanaux = async () => {
            if (!shopifyBoutique?.domain || !socket) return;
            socket.emit("changeShop", shopifyBoutique.domain);
            try {
                const data = await getDataBoutique(shopifyBoutique.domain, "salesChannels");
                const canauxPublication = data.response as CanauxPublication[];

                const canauxProduits: TCanal[] = canauxPublication.map((c) => {
                    return { ...c, isPublished: false };
                });
                setCanauxBoutique(canauxProduits);
            } catch (error) {
                console.error("Error fetching boutique data:", error);
            }
        };

        fetchCanaux();
    }, [shopifyBoutique?.domain, socket]);

    useEffect(() => {
        if (!socket) return;
        const handleShopChanged = () => {
            socket.on("shopChanged", (data) => {
                console.log(`${data.tagsCount} tags chargés pour ${data.shop}`);
            });
        };
        handleShopChanged();
        return () => {
            socket.off("shopChanged");
        };
    }, [socket]);

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
