import { Card } from "@/components/ui/card";
import { amazonService } from "@/library/pocketbase/AmazonService";
import AddKeys from "./AddKeys";
import StatusKeys from "./StatusKeys";
import { statusKeys } from "./server";

export default async function HomeKeys() {
    const [data, allMarketplaces] = await Promise.all([
        statusKeys(),
        amazonService.getAllMarketplaces(),
    ]);
    const marketplaces = allMarketplaces.map((mp) => ({ label: mp.domain, value: mp.domain }));

    return (
        <Card className="m-2 p-2">
            <AddKeys marketplaces={marketplaces} />
            <hr />
            <StatusKeys data={data} />
        </Card>
    );
}
