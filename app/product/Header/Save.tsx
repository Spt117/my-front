import useEditorHtmlStore from "@/components/editeurHtml/storeEditor";
import { formatHTML } from "@/components/editeurHtml/utils";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { updateProduct, updateCanauxVente, updateMetafieldGid } from "../serverAction";
import useProductStore from "../storeProduct";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";

export default function Save() {
    const { product, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { newTitle, loadingSave, setLoadingSave, statut, canauxProduct, metaTitle, metaDescription, ancreUrl } = useProductStore();
    const { hasChanges, modifiedHtml } = useEditorHtmlStore();

    if (!product || !shopifyBoutique) return null;

    const canauxActives = canauxBoutique.map((c) => {
        const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
        else return { id: c.id, isPublished: false, name: c.name };
    });

    const canauxToUpdate = canauxActives.filter((c) => c.isPublished !== canauxProduct.find((cp) => cp.id === c.id)?.isPublished);
    const metaTitleProduct = product?.metafields.nodes.find((mf) => mf.key === "title_tag");
    const metaDescriptionProduct = product?.metafields.nodes.find((mf) => mf.key === "description_tag");

    const hasMetaChanges = metaTitle.trim() !== (metaTitleProduct?.value.trim() || "") || metaDescription.trim() !== (metaDescriptionProduct?.value.trim() || "") || ancreUrl !== product.handle;
    const disabledSave = (!hasChanges && newTitle === product.title && statut === product.status && canauxToUpdate.length === 0 && !hasMetaChanges) || loadingSave;

    const handleSave = async () => {
        if (disabledSave || !product) return;
        setLoadingSave(true);
        if (hasChanges) {
            try {
                const descriptionHtml = formatHTML(modifiedHtml);
                const res = await updateProduct(shopifyBoutique.domain, product.id, "descriptionHtml", descriptionHtml);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde");
            }
        }
        if (newTitle !== product.title) {
            try {
                const res = await updateProduct(shopifyBoutique.domain, product.id, "title", newTitle);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde");
            }
        }
        if (ancreUrl.trim() !== product.handle) {
            try {
                const res = await updateProduct(shopifyBoutique.domain, product.id, "Handle", ancreUrl.trim());
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde de l'ancre d'URL");
            }
        }
        if (statut !== product.status) {
            try {
                const res = await updateProduct(shopifyBoutique.domain, product.id, "Statut", statut);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde");
            }
        }
        if (canauxToUpdate.length > 0) {
            try {
                const res = await updateCanauxVente(shopifyBoutique.domain, product.id, canauxToUpdate);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde des canaux de vente");
            }
        }
        if (metaDescriptionProduct?.id && metaDescription !== (metaDescriptionProduct?.value || "")) {
            try {
                const res = await updateMetafieldGid(shopifyBoutique.domain, product.id, metaDescriptionProduct.id, metaDescription);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde");
            }
        }
        if (metaTitleProduct?.id && metaTitle !== (metaTitleProduct?.value || "")) {
            try {
                const res = await updateMetafieldGid(shopifyBoutique.domain, product.id, metaTitleProduct.id, metaTitle);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde");
            }
        }
        if (ancreUrl !== product.handle) {
        }
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
            <span title="Sauvegarder les modifications" className="text-sm text-gray-500 italic">
                <SaveIcon color={disabledSave ? "gray" : "black"} size={33} className={disabledSave ? "cursor-not-allowed" : "cursor-pointer"} onClick={!disabledSave ? handleSave : undefined} />
            </span>
        );
    else return <Spinner className="ml-2" />;
}
