import { CanauxPublication, getDataBoutique } from "@/components/shopify/serverActions";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { SegmentParams } from "@/library/types/utils";
import { boutiqueFromId } from "@/params/paramsShopify";
import { ShopifyCollection } from "./collections/utils";
import ShopLayoutClient from "./ShopLayoutClient";

interface ShopLayoutProps {
    children: React.ReactNode;
    params: Promise<SegmentParams>;
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
    const { shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));

    // ✅ Chargement côté serveur
    let canauxPublication: CanauxPublication[] = [];
    let collections: ShopifyCollection[] = [];

    if (boutique) {
        try {
            // Chargement parallèle des données
            const [canauxData, collectionsData] = await Promise.all([
                getDataBoutique(boutique.domain, "salesChannels"),
                getDataBoutique(boutique.domain, "collections") as Promise<ResponseServer<ShopifyCollection[]>>,
            ]);

            canauxPublication = canauxData.response as CanauxPublication[];
            collections = collectionsData.response || [];
        } catch (error) {
            console.error("Error fetching shop data:", error);
        }
    }

    return (
        <ShopLayoutClient boutique={boutique} canauxPublication={canauxPublication} collections={collections} shopId={shopId}>
            {children}
        </ShopLayoutClient>
    );
}
