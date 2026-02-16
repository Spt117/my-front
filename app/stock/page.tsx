import ErrorPage from "@/components/layout/ErrorPage";
import { getStockVariant } from "@/library/models/variantShopify/middlewareVariants";
import MappingVariants from "./mappingVariants";

export default async function Page() {
    try {
        const data = await getStockVariant("bayblade-shops.myshopify.com");
        return <MappingVariants data={data} />;
    } catch (e) {
        console.error("Erreur chargement stock:", e);
        return <ErrorPage message="Impossible de charger les données de stock. Vérifiez la connexion au serveur." />;
    }
}
