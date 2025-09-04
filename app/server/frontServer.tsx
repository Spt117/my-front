"use client";

import { getServer } from "@/library/utils/fetchServer";
import { dataStock } from "./page";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function DataFront({ data }: { data: dataStock[] }) {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<dataStock[]>(data);

    const resetStock = async () => {
        setLoading(true);
        const url = `http://localhost:9100/remove-stock`;
        const res = await getServer(url);
        setStock(res);
        setLoading(false);
    };

    useEffect(() => {
        setStock(data);
    }, [data]);

    if (stock.length > 0)
        return (
            <div>
                {stock.map((item, index) => (
                    <div key={index}>
                        <h3>Domain: {item.domain}</h3>
                        <p>SKU: {item.sku}</p>
                    </div>
                ))}
                <Button onClick={resetStock} disabled={loading}>
                    {loading ? "Loading..." : "Reset Stock"}
                </Button>
            </div>
        );
}
