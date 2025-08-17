import { getAsinsAction } from "@/library/models/asins/middlewareAsin";
import AsinsClient from "./asinsclient";

export default async function Asins() {
    const asins = await getAsinsAction();
    if (!asins || !asins.data) return null;

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <h1 className="text-2xl font-bold">Liste des ASINs</h1>
            <AsinsClient asinsData={asins.data} />
        </div>
    );
}
