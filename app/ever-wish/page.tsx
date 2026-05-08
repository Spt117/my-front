import ErrorPage from "@/components/layout/ErrorPage";
import { listEverwishProducts } from "./actions";
import EverwishClient from "./components/EverwishClient";

export default async function EverWishPage() {
    try {
        const products = await listEverwishProducts();
        return <EverwishClient initialProducts={products} />;
    } catch (e) {
        console.error("Erreur chargement Ever Wish:", e);
        return <ErrorPage message="Impossible de charger la liste Ever Wish. Vérifiez la connexion à PocketBase." />;
    }
}
