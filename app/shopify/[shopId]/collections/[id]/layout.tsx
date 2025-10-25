import { getDataBoutique } from "@/components/shopify/serverActions";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { LayoutPropsShopify } from "@/components/shopify/utils";
import { boutiqueFromId } from "@/params/paramsShopify";
import { ShopifyCollectionWithProducts } from "../utils";
import CollectionLayoutClient from "./CollectionLayoutClient";

export default async function CollectionLayout({ children, params }: LayoutPropsShopify) {
    const { id, shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));

    let error = null;

    const collectionData = (await getDataBoutique(
        boutique.domain,
        "collectionGid",
        `gid://shopify/Collection/${id}`
    )) as ResponseServer<ShopifyCollectionWithProducts>;
    error = collectionData.error || null;
    const data = collectionData.response;

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-600">Collection introuvable.</p>
            </div>
        );
    }
    return (
        <CollectionLayoutClient error={error} data={data}>
            {children}
        </CollectionLayoutClient>
    );
}
