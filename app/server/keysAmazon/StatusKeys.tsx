"use client";

import { CardContent } from "@/components/ui/card";
import { IResponseFetch } from "@/library/utils/fetchServer";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { clearKeys } from "./server";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function StatusKeys({ data }: { data: IResponseFetch }) {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data?.message) toast.success(data.message);
        if (data?.error) toast.error(data.error);
        setStatus(JSON.stringify(data.response, null, 2));
    }, [data]);

    async function handleClearKeys() {
        setLoading(true);
        const res = await clearKeys();
        if (res?.message) toast.success(res.message);
        if (res?.error) toast.error(res.error);
        setStatus(JSON.stringify(res.response, null, 2));
        setLoading(false);
    }

    return (
        <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1>Status Amazon Keys</h1>
                <Button onClick={handleClearKeys} className="w-40" disabled={loading}>
                    Clear Keys Cache
                    {loading && <Spinner />}
                </Button>
            </div>
            <pre>{status}</pre>
        </CardContent>
    );
}
