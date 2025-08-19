"use client";
import { TAsin } from "@/library/models/asins/asinType";
import useAsinStore from "./asinStore";
import { useEffect } from "react";
import ActiveMarketplace from "./active-marketplace";

export default function AsinsClient({ asinsData }: { asinsData: TAsin[] }) {
    const { setAsins, asins } = useAsinStore();

    useEffect(() => {
        if (asinsData && asinsData.length > 0) {
            const arr2: TAsin[][] = Object.values(
                asinsData.reduce((acc: { [key: string]: TAsin[] }, item: TAsin) => {
                    (acc[item.asin] = acc[item.asin] || []).push(item);
                    return acc;
                }, {})
            );
            setAsins(arr2);
        }
    }, [asinsData, setAsins]);

    return (
        <div className="flex flex-col gap-4">
            {asins.map((asin: TAsin[], index) => (
                <ActiveMarketplace dataAsin={asin} key={index} />
            ))}
        </div>
    );
}
