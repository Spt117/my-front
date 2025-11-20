"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getServer } from "@/library/utils/fetchServer";
import { useEffect, useState } from "react";

export default function CacheWebhook() {
    const [cacheData, setCacheData] = useState("");

    useEffect(() => {
        const getCache = async () => {
            const url = "http://localhost:3001/cache";
            const res = await getServer(url);
            setCacheData(JSON.stringify(res, null, 2));
        };
        const interval = setInterval(() => {
            getCache();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="m-2 p-2">
            <CardContent className="flex flex-col gap-4">
                <h1>Cache Webhook Inventory Update</h1>
                <pre>{cacheData}</pre>
            </CardContent>
        </Card>
    );
}
