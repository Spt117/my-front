import { getDataBoutique } from "@/components/shopify/serverActions";
import { TDomainsShopify } from "@/library/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import ClientCollection from "./ClientCollection";
import { ResponseServer } from "@/components/shopify/typesShopify";
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
