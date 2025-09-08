import { getOrders } from "./serverAction";
import SocketOrder from "./RefreshOders";

export default async function Page() {
    const data = await getOrders();

    if (!data || !data.orders) return <div>Erreur lors de la récupération des commandes</div>;

    return (
        <div className="relative container flex flex-col justify-center items-center ">
            <SocketOrder products={data.products} ordersDomains={data.orders} />
        </div>
    );
}
