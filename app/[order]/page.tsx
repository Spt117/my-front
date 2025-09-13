import { TDomainsShopify } from "@/library/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import Order from "../../components/orders/Order";
import { getOrderById } from "../../components/orders/serverAction";

export default async function Page({ params, searchParams }: { params: Promise<SegmentParams>; searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { domain: TDomainsShopify };
    const p = (await params) as { order: string };
    const order = await getOrderById({ orderId: p.order, domain: query.domain });
    if (!order) return <div>Erreur lors de la récupération de la commande</div>;

    return <Order order={order} />;
}
