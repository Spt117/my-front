import { pokeUriServer } from "@/library/utils/uri";
import RefreshOders from "../components/shopify/orders/RefreshOders";
import { getOrders } from "../components/shopify/orders/serverAction";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders`;

    const data = await getOrders(url, false);

    if (!data || !data.orders) return <div>Erreur lors de la récupération des commandes</div>;

    return (
        <div className=" flex flex-col justify-center items-center relative">
            <RefreshOders products={data.products} orders={data.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))} />
        </div>
    );
}
