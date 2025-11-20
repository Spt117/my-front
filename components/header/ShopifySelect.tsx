"use client";

import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import Selecteur from "@/components/selecteur";
import { boutiqueFromDomain, boutiques, TDomainsShopify } from "@/params/paramsShopify";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import useShopifyStore from "../shopify/shopifyStore";
import SelectFull from "./SelectFull";

export default function ShopifySelect() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product } = useShopifyStore();
    const { cleanCollections } = useCollectionStore();
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

    function replaceShopifyId(url: string, newId: string | number) {
        // et tout ce qui suit
        const match = url.match(/\/shopify\/\d+\/([^\/]+)/);

        if (match) {
            const firstSlug = match[1];
            return `/shopify/${newId}/${firstSlug}/`;
        }

        // Si pas de slug après l'ID, retourne juste /shopify/[newId]/
        return url.replace(/\/shopify\/\d+\/?/, `/shopify/${newId}/`);
    }

    const handleSelectOrigin = (domain: string) => {
        const boutique = boutiqueFromDomain(domain as TDomainsShopify);
        setShopifyBoutique(boutique);
        cleanCollections();
        if (product) setProduct(null);

        if (path.includes("orders")) {
            router.push(`/shopify/${boutique.id}/orders`);
            return;
        }
        const newUrl = replaceShopifyId(path, boutique.id);
        router.push(newUrl);
    };

    return (
        <div className="">
            <Selecteur
                className="xl:hidden"
                array={option2}
                value={shopifyBoutique?.domain || ""}
                onChange={handleSelectOrigin}
                placeholder="Choisir l'origine"
            />
            <SelectFull action={handleSelectOrigin} options={option2} currentValue={shopifyBoutique?.domain || ""} />
        </div>
    );
}
