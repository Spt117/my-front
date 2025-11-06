import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import ShopifyDashboard from "../stats/Data";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/statistic-products`;
    const res = await getServer(url);

    if (!res.message || res.error) {
        return <div>Erreur lors de la récupération des données</div>;
    }

    return <ShopifyDashboard data={res.response} />;
}
