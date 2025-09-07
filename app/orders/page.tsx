import { IOrdersDomains } from "@/library/shopify/orders";
import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import MapOrdersDomains from "./mapOrdersDomains";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders`;
    const response = await getServer(url);
    if (!response || !response.response) return <div>Erreur lors de la récupération des commandes</div>;

    const data: IOrdersDomains[] = response.response;

    return <MapOrdersDomains ordersDomains={data} />;
}
