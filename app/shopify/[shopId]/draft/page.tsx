import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { boutiqueFromId } from "@/params/paramsShopify";
import { headers } from "next/headers";
import DraftProducts from "./DraftProducts";

export default async function Page() {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";
    const boutique = boutiqueFromId(Number(pathname.split("/")[2]));
    const url = `${pokeUriServer}/shopify/draft-products?domain=${boutique?.domain}`;
    const response = await getServer(url);
    const draftProducts = response.response.products;

    return (
        <div className="p-4 flex flex-col items-center justify-center">
            <DraftProducts products={draftProducts} />
        </div>
    );
}
