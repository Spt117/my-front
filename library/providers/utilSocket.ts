const topics = ["orders/paid", "orders/fulfilled", "inventory_levels/update", "products/update"] as const;
export type TTopics = (typeof topics)[number];
