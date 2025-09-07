import { IOrdersDomains } from "@/library/shopify/orders";
import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import MapOrdersDomains from "./mapOrdersDomains";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders`;
    const response = await getServer(url);
    const data: IOrdersDomains[] = response.response;

    return <MapOrdersDomains ordersDomains={data} />;
}
