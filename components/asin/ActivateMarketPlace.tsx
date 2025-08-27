import { Switch } from "../ui/switch";
import { useGetAsins } from "@/library/hooks/useGetAsins";
import { useState } from "react";
import { Spinner } from "../ui/shadcn-io/spinner/index";
import { TAsin } from "@/library/models/asins/asinType";
import { activeAsinByMarketPlaceAction } from "@/library/models/asins/middlewareAsin";
import { getMarketplace } from "@/library/params/paramsAmazon";

export default function ActivateMarketPlace({ asin }: { asin: TAsin }) {
    const { getAsins } = useGetAsins();
    const [loading, setLoading] = useState(false);
    const marketplace = getMarketplace(asin.marketPlace);

    const handleSwitchChange = async () => {
        setLoading(true);
        await activeAsinByMarketPlaceAction(asin);
        await getAsins();
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2 mb-2  ">
            <Switch disabled={loading} checked={asin.active} onCheckedChange={handleSwitchChange} className="ml-2" />
            {!loading && (
                <span className="mr-2">
                    <a href={`https://${marketplace.marketplace}/dp/${asin.asin}`} className="hover:underline text-blue-400" target="_blank" rel="noopener noreferrer">
                        {asin.marketPlace}
                    </a>
                </span>
            )}
            {loading && <Spinner className="w-4 h-4" />}
        </div>
    );
}
