import Order from "@/components/shopify/orders/Order";
import { getOrderById } from "@/components/shopify/orders/serverAction";
import { SegmentParams } from "@/library/types/utils";
import { boutiqueFromId } from "@/params/paramsShopify";
import { headers } from "next/headers";

export default async function Page({ params }: { params: Promise<SegmentParams> }) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";

    const boutique = boutiqueFromId(pathname.split("/")[2]);
    const { orderId } = (await params) as { orderId: string };
    const order = await getOrderById({ orderId, domain: boutique.domain });
    if (!order) return <div>Erreur lors de la récupération de la commande</div>;

    return <Order order={order} />;
}
