import useEditorHtmlStore from "@/components/editeurHtml/storeEditor";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { SaveIcon } from "lucide-react";
import useProductStore from "../../../products/[productId]/storeProduct";
import useCollectionStore from "../../storeCollections";
import { useEffect } from "react";

export default function Save() {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();

    const { hasChanges, modifiedHtml } = useEditorHtmlStore();
    const {
        dataCollection,
        setLoadingSave,
        loadingSave,
        collectionTitle,
        collectionDescription,
        ancreUrl,
        metaDescription,
        metaTitle,
        canauxCollection,
    } = useCollectionStore();
    const { getProductData } = useDataProduct();

    if (!dataCollection || !shopifyBoutique) return null;

    const canauxActives = canauxBoutique.map((c) => {
        const found = dataCollection?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
        else return { id: c.id, isPublished: false, name: c.name };
    });

    const canauxToUpdate = canauxActives.filter((c) => c.isPublished !== canauxCollection.find((cp) => cp.id === c.id)?.isPublished);
    const metaTitleCollection = dataCollection.seo.title;
    const metaDescriptionCollection = dataCollection.seo.description;

    const hasMetaChanges =
        metaTitle?.trim() !== (metaTitleCollection?.trim() || "") ||
        metaDescription?.trim() !== (metaDescriptionCollection?.trim() || "") ||
        ancreUrl !== dataCollection.handle;
    const disabledSave = !hasChanges && !hasMetaChanges;
    // !hasChanges && collectionTitle === dataCollection.title && canauxToUpdate.length === 0 && !hasMetaChanges;

    const handleSave = async () => {
        if (disabledSave || !dataCollection) return;
        setLoadingSave(true);

        await getProductData();
        setLoadingSave(false);
    };

    const handleSaveShortcut = () => {
        if (disabledSave) return;
        const activeElement = document.activeElement;
        const isInEditor = activeElement?.closest(".ProseMirror") !== null;
        const isInTextarea = activeElement?.tagName === "TEXTAREA";
        if (isInEditor || isInTextarea) {
            return; // Ne pas sauvegarder
        } else handleSave();
    };

    useKeyboardShortcuts("Enter", handleSaveShortcut);
    useKeyboardShortcuts({ key: "Enter", ctrl: true }, handleSave);

    if (!loadingSave)
        return (
            <span title="Sauvegarder les modifications" className="text-sm text-gray-500">
                <SaveIcon
                    color={disabledSave ? "gray" : "black"}
                    size={33}
                    className={disabledSave ? "cursor-not-allowed" : "cursor-pointer"}
                    onClick={!disabledSave ? handleSave : undefined}
                />
            </span>
        );
    else return <Spinner className="ml-2" />;
}
