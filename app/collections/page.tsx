import { getDataBoutique } from "@/components/shopify/serverActions";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { SegmentParams } from "@/library/types/utils";
import { TDomainsShopify } from "@/params/paramsShopify";
import ClientCollection from "./ClientCollection";
import { ShopifyCollection } from "./utils";

export default async function Page({ searchParams }: { searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { domain: TDomainsShopify };

    const collectionsData = (await getDataBoutique(query.domain, "collections")) as ResponseServer<ShopifyCollection[]>;

    return (
        <div>
            {collectionsData.error && <div className="text-red-500">Erreur: {collectionsData.error}</div>}
            <ClientCollection shopifyCollection={collectionsData.response} />
        </div>
    );
}
