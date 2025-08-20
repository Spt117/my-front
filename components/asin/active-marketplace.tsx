import { TAsin } from "@/library/models/asins/asinType";
import { amazonMarketPlaces, getMarketplace } from "@/library/params/paramsAmazon";
import { Card } from "../ui/card";
import ActivateMarketPlace from "./ActivateMarketPlace";

export default function ActiveMarketplace({ dataAsin }: { dataAsin: TAsin[] }) {
    if (!dataAsin || dataAsin.length === 0) return null;

    const marketplace = getMarketplace(dataAsin[0].marketPlace);

    return (
        <Card className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
            {dataAsin[0].title && (
                <h3 className="text-lg font-semibold">
                    <a href={`https://${marketplace.marketplace}/dp/${dataAsin[0].asin}`} className="hover:underline text-blue-400" target="_blank" rel="noopener noreferrer">
                        {dataAsin[0].title}
                    </a>
                </h3>
            )}
            <span className="text-lg font-semibold">{dataAsin[0].asin}</span>
            <span className="text-sm text-gray-500">
                {dataAsin.map((asin: TAsin, index: number) => (
                    <ActivateMarketPlace asin={asin} key={index} />
                ))}
            </span>
        </Card>
    );
}
