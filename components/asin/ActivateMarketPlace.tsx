import { Switch } from "../ui/switch";
import { useGetAsins } from "@/library/hooks/useGetAsins";
import { useState } from "react";
import { Spinner } from "../ui/shadcn-io/spinner/index";
import { TAsin } from "@/library/models/asins/asinType";
import { activeAsinByMarketPlaceAction } from "@/library/models/asins/middlewareAsin";

export default function ActivateMarketPlace({ asin }: { asin: TAsin }) {
    const { getAsins } = useGetAsins();
    const [loading, setLoading] = useState(false);

    const handleSwitchChange = async () => {
        setLoading(true);
        await activeAsinByMarketPlaceAction(asin);
        await getAsins();
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2 mb-2  ">
            <Switch disabled={loading} checked={asin.active} onCheckedChange={handleSwitchChange} className="ml-2" />
            {!loading && <span className="mr-2">{asin.marketPlace}</span>}
            {loading && <Spinner className="w-4 h-4" />}
        </div>
    );
}
