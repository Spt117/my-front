import { Card } from "../ui/card";
import { marketPlaceEnum, TALerteMarketPlace, TAsin } from "@/library/models/asins/asinType";
import ActivateMarketPlace from "./ActivateMarketPlace";

export default function ActiveMarketplace({ dataAsin }: { dataAsin: TAsin }) {
    const m = marketPlaceEnum.map((marketPlace) => {
        if (dataAsin[marketPlace] !== undefined)
            return {
                marketPlace,
                active: dataAsin[marketPlace],
            };
    }) as TALerteMarketPlace[];

    return (
        <Card className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
            <span className="text-lg font-semibold">{dataAsin.asin}</span>
            <span className="text-sm text-gray-500">
                {m.map((marketPlaceAlert: TALerteMarketPlace, index: number) => (
                    <ActivateMarketPlace marketPlace={marketPlaceAlert} asin={dataAsin.asin} key={index} />
                ))}
            </span>
        </Card>
    );
}
