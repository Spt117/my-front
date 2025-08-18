"use client";
import { TAsin } from "@/library/models/asins/asinType";
import useAsinStore from "./asinStore";
import { useEffect } from "react";
import ActiveMarketplace from "./active-marketplace";

export default function AsinsClient({ asinsData }: { asinsData: TAsin[] }) {
    const { setAsins, asins } = useAsinStore();

    useEffect(() => {
        if (asinsData && asinsData.length > 0) setAsins(asinsData);
    }, [asinsData, setAsins]);

    return (
        <div className="flex flex-col gap-4">
            {asins.map((asin: TAsin) => (
                <ActiveMarketplace dataAsin={asin} key={asin.asin} />
            ))}
        </div>
    );
}
