import { Card } from "../ui/card";
import { marketPlaceEnum, TAsin } from "@/library/models/asins/asinType";
import ActivateMarketPlace from "./ActivateMarketPlace";

export default function ActiveMarketplace({ dataAsin }: { dataAsin: TAsin[] }) {
    if (!dataAsin || dataAsin.length === 0) return null;

    console.log("ActiveMarketplace dataAsin", dataAsin);

    return (
        <Card className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
            {dataAsin[0].title && <h3 className="text-lg font-semibold">{dataAsin[0].title}</h3>}
            <span className="text-lg font-semibold">{dataAsin[0].asin}</span>
            <span className="text-sm text-gray-500">
                {dataAsin.map((asin: TAsin, index: number) => (
                    <ActivateMarketPlace asin={asin} key={index} />
                ))}
            </span>
        </Card>
    );
}
