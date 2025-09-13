import { pokeUriServer } from "@/library/utils/uri";
import RefreshOders from "../../components/orders/RefreshOders";
import { getOrders } from "../../components/orders/serverAction";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders-fulfilled`;

    const data = await getOrders(url);

    if (!data || !data.orders) return <div>Erreur lors de la récupération des commandes</div>;

    return (
        <div className="container flex flex-col justify-center items-center">
            <RefreshOders products={data.products} orders={data.orders} />
        </div>
    );
}
