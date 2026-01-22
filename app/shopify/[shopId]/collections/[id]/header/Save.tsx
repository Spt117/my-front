import useEditorHtmlStore from "@/components/editeurHtml/storeEditor";
import { updateCanauxVente } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCollection } from "../../server";
import useCollectionStore from "../../storeCollections";

export default function Save() {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();
    const router = useRouter();

    const { hasChanges, modifiedHtml } = useEditorHtmlStore();
    const { dataCollection, setLoadingSave, loadingSave, collectionTitle, collectionDescriptionHtml, ancreUrl, metaDescription, metaTitle, canauxCollection } =
        useCollectionStore();
    const { getProductData } = useDataProduct();

    if (!dataCollection || !shopifyBoutique) return null;

    const canauxActives = canauxBoutique.map((c) => {
        const found = dataCollection?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
        else return { id: c.id, isPublished: false, name: c.name };
    });

    const canauxToUpdate = canauxCollection.filter((cp) => {
        const active = canauxActives.find((ca) => ca.id === cp.id);
        return active && active.isPublished !== cp.isPublished;
    });
    const metaTitleCollection = dataCollection.seo.title;
    const metaDescriptionCollection = dataCollection.seo.description;

    const hasMetaChanges =
        metaTitle?.trim() !== (metaTitleCollection?.trim() || "") || metaDescription?.trim() !== (metaDescriptionCollection?.trim() || "") || ancreUrl !== dataCollection.handle;

    const hasGeneralChanges = collectionTitle !== dataCollection.title || collectionDescriptionHtml !== dataCollection.descriptionHtml;

    const disabledSave = !hasGeneralChanges && !hasMetaChanges && canauxToUpdate.length === 0;

    const handleSave = async () => {
        if (disabledSave || !dataCollection) return;
        setLoadingSave(true);

        try {
            const input: any = {};
            if (collectionTitle !== dataCollection.title) input.title = collectionTitle;
            if (collectionDescriptionHtml !== dataCollection.descriptionHtml) input.descriptionHtml = collectionDescriptionHtml;
            if (ancreUrl !== dataCollection.handle) input.handle = ancreUrl;

            if (metaTitle?.trim() !== (metaTitleCollection?.trim() || "") || metaDescription?.trim() !== (metaDescriptionCollection?.trim() || "")) {
                input.seo = {
                    title: metaTitle,
                    description: metaDescription,
                };
            }

            const res = await updateCollection(shopifyBoutique.domain, dataCollection.id, input);

            if (res.message) {
                toast.success(res.message);
                router.refresh();
            } else if (res.error) {
                toast.error(res.error);
            }

            if (canauxToUpdate.length > 0) {
                const resCanaux = await updateCanauxVente(shopifyBoutique.domain, dataCollection.id, canauxToUpdate);
                if (resCanaux?.message) toast.success(resCanaux.message);
                if (resCanaux?.error) toast.error(resCanaux.error);
            }
        } catch (error) {
            console.error("Error saving collection:", error);
            toast.error("Une erreur est survenue lors de la sauvegarde.");
        } finally {
            setLoadingSave(false);
        }
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
            <Button
                disabled={disabledSave}
                onClick={handleSave}
                className={`rounded-lg gap-2 shadow-sm transition-all ${
                    disabledSave ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
            >
                <SaveIcon size={18} />
                <span>Enregistrer</span>
            </Button>
        );
    else
        return (
            <Button disabled className="rounded-lg bg-blue-600/50 cursor-not-allowed">
                <Spinner className="w-4 h-4 mr-2" /> Enregistrement...
            </Button>
        );
}
