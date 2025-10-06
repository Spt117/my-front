"use client";
import useEditorHtmlStore from "@/components/editeurHtml/storeEditor";
import { formatHTML } from "@/components/editeurHtml/utils";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useCopy } from "@/library/hooks/useCopy";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { Globe, Save, Tag } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import useShopifyStore from "../../components/shopify/shopifyStore";
import { updateCanauxVente, updateProduct } from "./serverAction";
import useProductStore from "./storeProduct";
import { useEffect } from "react";

export default function HeaderProduct() {
    const { handleCopy } = useCopy();
    const { product, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { newTitle, loadingSave, setLoadingSave, statut, canauxProduct } = useProductStore();
    const { hasChanges, modifiedHtml } = useEditorHtmlStore();

    if (!product || !shopifyBoutique) return null;

    const productUrl = `https://${shopifyBoutique.domain}/products/${product.handle}`;

    const canauxActives = canauxBoutique.map((c) => {
        const found = product?.resourcePublicationsV2.nodes.find((node) => node.publication.id === c.id);
        if (found) return { id: c.id, isPublished: found.isPublished, name: c.name };
        else return { id: c.id, isPublished: false, name: c.name };
    });

    const canauxToUpdate = canauxActives.filter((c) => c.isPublished !== canauxProduct.find((cp) => cp.id === c.id)?.isPublished);

    const disabledSave =
        (!hasChanges && newTitle === product.title && statut === product.status && canauxToUpdate.length === 0) || loadingSave;
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
                console.log("canauxToUpdate", canauxToUpdate);
                const res = await updateCanauxVente(shopifyBoutique.domain, product.id, canauxToUpdate);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (err) {
                console.log(err);
                toast.error("Erreur lors de la sauvegarde des canaux de vente");
            }
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

    return (
        <CardHeader className="sticky top-12 w-full z-10 p-1 bg-gray-50 ">
            <div className="flex items-center justify-between">
                <CardTitle
                    onClick={() => {
                        handleCopy(product.title);
                    }}
                    className="flex items-center gap-2 text-lg font-semibold cursor-pointer transition-transform duration-500 ease-out active:scale-85"
                    title="Cliquer pour copier le titre"
                >
                    <Tag size={20} className={`text-gray-500`} />
                    {product.title}
                </CardTitle>
                <div className="flex gap-2 items-center mr-2">
                    {!loadingSave && (
                        <span title="Sauvegarder les modifications" className="text-sm text-gray-500 italic">
                            <Save
                                color={disabledSave ? "gray" : "black"}
                                size={33}
                                className={disabledSave ? "cursor-not-allowed" : "cursor-pointer"}
                                onClick={!disabledSave ? handleSave : undefined}
                            />
                        </span>
                    )}
                    {loadingSave && <Spinner className="ml-2" />}
                    <a href={productUrl} target="_blank" rel="noopener noreferrer">
                        <span title="Voir le produit sur la boutique">
                            <Globe size={33} className="ml-2" />
                        </span>
                    </a>
                    <a
                        href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            title="Editer sur Shopify"
                            src="/shopify.png"
                            alt="Flag"
                            width={20}
                            height={20}
                            className="ml-2 object-contain w-auto h-auto"
                        />
                    </a>
                </div>
            </div>
        </CardHeader>
    );
}
