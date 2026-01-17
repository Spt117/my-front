import { CanauxPublication, getDataBoutique } from "@/components/shopify/serverActions";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { SegmentParams } from "@/library/types/utils";
import { boutiqueFromId, TDomainsShopify } from "@/params/paramsShopify";
import { ShopifyCollection } from "./collections/utils";
import ShopLayoutClient from "./ShopLayoutClient";
import { getShopSettings } from "./boutique/serverAction";

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
    let settings = { amazonPartnerId: "", amazonDomain: "" };

    if (boutique) {
        // Chargement parallèle des données
        const [canauxData, collectionsData, settingsData] = await Promise.all([
            getDataBoutique(boutique.domain, "salesChannels"),
            getDataBoutique(boutique.domain, "collections") as Promise<ResponseServer<ShopifyCollection[]>>,
            getShopSettings(boutique.domain as TDomainsShopify),
        ]);

        if (canauxData.response) canauxPublication = canauxData.response as CanauxPublication[];
        if (collectionsData.response) collections = collectionsData.response as ShopifyCollection[];
        if (settingsData) settings = settingsData;
    }

    return (
        <ShopLayoutClient boutique={boutique} canauxPublication={canauxPublication} collections={collections} shopId={shopId} settings={settings}>
            {children}
        </ShopLayoutClient>
    );
}
