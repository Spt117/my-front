import { pokeUriServer } from "@/library/utils/uri";
import RefreshOders from "./RefreshOders";
import { getOrders } from "./serverAction";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders`;

    const data = await getOrders(url);

    if (!data || !data.orders) return <div>Erreur lors de la récupération des commandes</div>;

    return (
        <div className="container flex flex-col justify-center items-center relative">
            <RefreshOders products={data.products} orders={data.orders} />
        </div>
    );
}
