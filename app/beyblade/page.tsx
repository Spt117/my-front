import ErrorPage from "@/components/layout/ErrorPage";
import { IconSword, IconTrendingUp } from "@tabler/icons-react";
import { beybladeService } from "../beycommunity/supabase/beyblade-service";
import { DevProductCreator } from "./components/DevProductCreator";
import { ShopifyPublicationsList } from "./components/ShopifyPublicationsList";

export default async function BeybladePage() {
    let products;
    try {
        products = await beybladeService.getFullList();
    } catch (e) {
        console.error("Erreur chargement produits Beyblade:", e);
        return <ErrorPage message="Impossible de charger le catalogue Beyblade. Vérifiez la connexion à Supabase." />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                                <IconSword className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Beyblade X</h1>
                                <p className="text-slate-400">Catalogue des produits et références</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                            <IconTrendingUp className="text-emerald-400 w-5 h-5" />
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Produits</p>
                                <p className="text-xl font-black text-white">{products.length}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Section Création */}
                <div className="mb-12">
                    <DevProductCreator />
                </div>

                {/* Publications Shopify */}
                <div className="mb-12">
                    <ShopifyPublicationsList />
                </div>

                {/* Liste des Produits */}
            </div>
        </div>
    );
}
