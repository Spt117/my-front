import ErrorPage from "@/components/layout/ErrorPage";
import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { boutiqueFromId } from "@/params/paramsShopify";
import DraftProducts from "./DraftProducts";

export default async function Page({ params }: { params: Promise<{ shopId: string }> }) {
    const { shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));

    try {
        const url = `${pokeUriServer}/shopify/draft-products?domain=${boutique?.domain}`;
        const response = await getServer(url);
        const draftProducts = response?.response?.products || [];
        const error = response?.error || null;

        return (
            <div className="p-4 flex flex-col items-center justify-center">
                <DraftProducts products={draftProducts} error={error} />
            </div>
        );
    } catch (e) {
        console.error("Erreur chargement brouillons:", e);
        return <ErrorPage message="Impossible de charger les brouillons. Vérifiez la connexion au serveur." />;
    }
}
