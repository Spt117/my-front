import Order from "./Order";
import useOrdersStore from "./store";

export default function MappingOrders() {
    const { filterOrders, mode } = useOrdersStore();

    if (mode !== "orders") return null;
    return (
        <>
            <h1 className="text-2xl font-bold m-3">{filterOrders.length} commandes</h1>
            {filterOrders.map((order, index) => (
                <Order key={index} order={order} />
            ))}
        </>
    );
}
