import { SegmentParams } from "@/library/types/utils";
import Order from "../Order";
import { postServer } from "@/library/utils/fetchServer";
import { TDomainsShopify } from "@/library/params/paramsShopify";

export default async function Page({ params, searchParams }: { params: Promise<SegmentParams>; searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { domain: TDomainsShopify };
    const p = (await params) as { order: string };
    const url = `http://localhost:9100/shopify/get-order-by-id`;
    const res = await postServer(url, { orderId: p.order, domain: query.domain });

    if (!res || !res.response) return <div>Erreur lors de la récupération de la commande</div>;
    return <Order order={res.response} />;
}
