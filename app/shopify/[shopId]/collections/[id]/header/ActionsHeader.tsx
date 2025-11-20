import useShopifyStore from "@/components/shopify/shopifyStore";
import { Globe } from "lucide-react";
import Image from "next/image";
import useCollectionStore from "../../storeCollections";
import Save from "./Save";

export default function ActionsHeader() {
    const { shopifyBoutique, openDialog } = useShopifyStore();
    const { dataCollection } = useCollectionStore();

    if (!shopifyBoutique || !dataCollection) return null;

    const collectionUrl = `https://${shopifyBoutique.publicDomain}/collections/${dataCollection.handle}`;
    return (
        <div className="flex gap-2 items-center mr-2">
            <Save />
            {dataCollection.resourcePublicationsV2.nodes.length > 0 && (
                <a href={collectionUrl} target="_blank" rel="noopener noreferrer">
                    <span title="Voir le produit sur la boutique">
                        <Globe size={30} />
                    </span>
                </a>
            )}
            <a
                href={`https://${shopifyBoutique.domain}/admin/collections/${dataCollection.id.split("/").pop()}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    title="Editer sur Shopify"
                    src="/shopify.png"
                    alt="Flag"
                    width={30}
                    height={30}
                    className="w-auto h-auto object-cover rounded"
                />
            </a>
        </div>
    );
}
