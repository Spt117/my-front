import { CanauxPublication, getDataBoutique } from "@/components/shopify/serverActions";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { SegmentParams } from "@/library/types/utils";
import { boutiqueFromId } from "@/library/pocketbase/ShopifyBoutiqueService";
import { ShopifyCollection } from "./collections/utils";
import ShopLayoutClient from "./ShopLayoutClient";
import { getShippingTranslation, getShopSettings, ShippingTranslation } from "./boutique/serverAction";

interface ShopLayoutProps {
    children: React.ReactNode;
    params: Promise<SegmentParams>;
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
    const { shopId } = await params;
    const boutique = await boutiqueFromId(Number(shopId));

    // ✅ Chargement côté serveur
    let canauxPublication: CanauxPublication[] = [];
    let collections: ShopifyCollection[] = [];
    let settings = { amazonPartnerId: "", amazonDomain: "" };
    let shippingTranslation: ShippingTranslation | null = null;

    if (boutique) {
        // Chargement parallèle des données
        const [canauxData, collectionsData, settingsData, shippingTranslationData] = await Promise.all([
            getDataBoutique(boutique.domain, "salesChannels"),
            getDataBoutique(boutique.domain, "collections") as Promise<ResponseServer<ShopifyCollection[]>>,
            getShopSettings(boutique.domain),
            getShippingTranslation(boutique.domain),
        ]);

        if (canauxData.response) canauxPublication = canauxData.response as CanauxPublication[];
        if (collectionsData.response) collections = collectionsData.response as ShopifyCollection[];
        if (settingsData) settings = settingsData;
        shippingTranslation = shippingTranslationData;
    }

    return (
        <ShopLayoutClient boutique={boutique} canauxPublication={canauxPublication} collections={collections} shopId={shopId} settings={settings} shippingTranslation={shippingTranslation}>
            {children}
        </ShopLayoutClient>
    );
}
