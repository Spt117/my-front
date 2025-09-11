import { pokeUriServer } from "@/library/utils/uri";
import { getOrders } from "./serverAction";
import RefreshOders from "./RefreshOders";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders`;

    const data = await getOrders(url);

    console.log(data);

    if (!data || !data.orders) return <div>Erreur lors de la récupération des commandes</div>;

    return (
        <div className="container flex flex-col justify-center items-center relative">
            <RefreshOders products={data.products} ordersDomains={data.orders} />
        </div>
    );
}
