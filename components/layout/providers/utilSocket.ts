const topics = ["orders/paid", "orders/fulfilled", "inventory_levels/update", "products/update", "products/create"] as const;
export type TTopics = (typeof topics)[number];
