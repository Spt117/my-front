import { acitveAsinByMarketPlaceAction } from "@/library/models/asins/middlewareAsin";
import { Switch } from "../ui/switch";
import { TALerteMarketPlace } from "@/library/models/asins/asinType";
import { useGetAsins } from "@/library/hooks/useGetAsins";
import { useState } from "react";
import { Spinner } from "../ui/shadcn-io/spinner/index";

export default function ActivateMarketPlace({ asin, marketPlace }: { asin: string; marketPlace: TALerteMarketPlace }) {
    const { getAsins } = useGetAsins();
    const [loading, setLoading] = useState(false);

    const handleSwitchChange = async (marketPlace: TALerteMarketPlace) => {
        setLoading(true);
        await acitveAsinByMarketPlaceAction(asin, marketPlace);
        await getAsins();
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2 mb-2  ">
            <Switch disabled={loading} checked={marketPlace.active} onCheckedChange={() => handleSwitchChange(marketPlace)} className="ml-2" />
            {!loading && <span className="mr-2">{marketPlace.marketPlace}</span>}
            {loading && <Spinner className="w-4 h-4" />}
        </div>
    );
}
