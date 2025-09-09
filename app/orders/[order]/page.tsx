import { TDomainsShopify } from "@/library/params/paramsShopify";
import { IShopifyOrderResponse } from "@/library/types/shopifySearch";
import { SegmentParams } from "@/library/types/utils";
import { postServer } from "@/library/utils/fetchServer";
import Order from "../Order";

export default async function Page({ params, searchParams }: { params: Promise<SegmentParams>; searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { domain: TDomainsShopify };
    const p = (await params) as { order: string };
    const url = `http://localhost:9100/shopify/get-order-by-id`;
    const res = (await postServer(url, { orderId: p.order, domain: query.domain })) as IShopifyOrderResponse;
    if (!res) return <div>Erreur lors de la récupération de la commande</div>;

    return <Order orderData={res} />;
}
