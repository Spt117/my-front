"use client";
import Selecteur from "@/components/selecteur";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { TAmazonKeys } from "@/library/models/keysAmazon/keysDeploy";
import { addKeys } from "@/library/models/keysAmazon/middleware";
import { amazonMarketPlaces } from "@/params/paramsAmazon";
import { getServer } from "@/library/utils/fetchServer";
import { useState } from "react";
import { toast } from "sonner";
import { clearKeys } from "./server";

export default function AddKeys() {
    const marketplaces = amazonMarketPlaces.map((mp) => ({ label: mp.domain, value: mp.domain }));
    const [data, setData] = useState<TAmazonKeys>({
        accessKeyId: "",
        secretAccessKey: "",
        marketplace: marketplaces[0].value,
    });
    const [loading, setLoading] = useState(false);

    const handleAddKeys = async () => {
        setLoading(true);
        try {
            if (!data.accessKeyId || !data.secretAccessKey || !data.marketplace) {
                toast.error("Please fill all fields");
                return;
            }
            const res = await addKeys(data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
            clearKeys();
        } catch (error) {
            toast.error("An error occurred while adding keys");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CardContent className="flex flex-col gap-4">
            <h1>Add Amazon Keys</h1>
            <CardAction className="flex gap-4 flex-wrap">
                <Selecteur value={data?.marketplace} array={marketplaces} onChange={(value) => setData((d) => ({ ...d, marketplace: value } as TAmazonKeys))} placeholder="Select Marketplace" />
                <Input type="text" placeholder="Access Key ID" value={data?.accessKeyId} onChange={(e) => setData((d) => ({ ...d, accessKeyId: e.target.value } as TAmazonKeys))} />
                <Input type="text" placeholder="Secret Access Key" value={data?.secretAccessKey} onChange={(e) => setData((d) => ({ ...d, secretAccessKey: e.target.value } as TAmazonKeys))} />
                <Button onClick={handleAddKeys} disabled={loading}>
                    {loading ? "Adding..." : "Add Keys"}
                    {loading && <Spinner className="ml-2" />}
                </Button>
            </CardAction>
        </CardContent>
    );
}
