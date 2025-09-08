"use client";

import Order from "../Order";
import useOrdersStore from "../store";

export default function Page() {
    const { ordersSearch } = useOrdersStore();

    return <Order order={ordersSearch[0]} />;
}
