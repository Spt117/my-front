// LinkControls.tsx — nouveau composant (bouton + modale lien)
"use client";
import { updateProduct } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import { Button } from "@/components/ui/button";
import type { Editor } from "@tiptap/react";
import { Link2, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useShopifyStore from "../shopify/shopifyStore";
import { Spinner } from "../ui/shadcn-io/spinner/index";
import useEditorHtmlStore from "./storeEditor";
import { formatHTML } from "./utils";

export function LinkControls({ editor }: { editor: Editor }) {
    const { linkDialogOpen, openLinkDialog, closeLinkDialog } = useEditorHtmlStore();
    const { product, shopifyBoutique } = useShopifyStore();
    const router = useRouter();

    const [loadingSave, setLoadingSave] = useState<boolean>(false);
    const [href, setHref] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [newTab, setNewTab] = useState<boolean>(false);

    // Ouvre la modale en pré-remplissant si le focus est sur un lien
    const onOpen = () => {
        const isOnLink = editor.isActive("link");
        const attrs = editor.getAttributes("link") ?? {};
        setHref(isOnLink ? attrs.href ?? "" : "");
        setTitle(isOnLink ? attrs.title ?? "" : "");
        setNewTab(isOnLink ? attrs.target === "_blank" : false);
        openLinkDialog();
    };

    const onSave = async () => {
        // Si href vide → retirer le lien
        if (!href.trim()) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            closeLinkDialog();
            return;
        }

        const attrs: { href: string; title?: string; target?: string } = {
            href: href.trim(),
        };

        if (title.trim()) {
            attrs.title = title.trim();
        }

        if (newTab) {
            attrs.target = "_blank";
        }

        editor.chain().focus().extendMarkRange("link").unsetLink().setLink(attrs).run();

        try {
            if (!product || !shopifyBoutique) {
                toast.error("Impossible de sauvegarder le lien : produit ou boutique introuvable.");
                closeLinkDialog();
                return;
            }
            setLoadingSave(true);
            // Récupérer le HTML directement depuis l'éditeur après avoir appliqué le lien
            const descriptionHtml = formatHTML(editor.getHTML());
            const res = await updateProduct(shopifyBoutique.domain, product.id, "descriptionHtml", descriptionHtml);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (err) {
            console.log(err);
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setLoadingSave(false);
        }
        router.refresh();
        closeLinkDialog();
    };

    const onRemove = () => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        closeLinkDialog();
    };

    // Fermer sur Esc
    useEffect(() => {
        if (!linkDialogOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLinkDialog();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [linkDialogOpen, closeLinkDialog]);

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("link") ? "bg-slate-300" : ""}
                onClick={onOpen}
                title={editor.isActive("link") ? "Modifier le lien" : "Ajouter un lien"}
            >
                <Link2 className="w-4 h-4" />
            </Button>

            {linkDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40" onClick={closeLinkDialog} />
                    {/* Dialog */}
                    <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-4 shadow-xl">
                        <div className="mb-3">
                            <h3 className="text-base font-semibold">{editor.isActive("link") ? "Modifier le lien" : "Ajouter un lien"}</h3>
                            <p className="text-xs text-slate-500">Lien appliqué à la sélection actuelle. Laissez vide pour retirer.</p>
                        </div>

                        <div className="space-y-3">
                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-600">URL</span>
                                <input
                                    autoFocus
                                    type="url"
                                    inputMode="url"
                                    placeholder="https://exemple.com"
                                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={href}
                                    onChange={(e) => setHref(e.target.value)}
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-600">Title (balise title)</span>
                                <input
                                    type="text"
                                    placeholder="Texte info-bulle (optionnel)"
                                    className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newTab}
                                    onChange={(e) => setNewTab(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">Ouvrir dans un nouvel onglet</span>
                            </label>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                            <Button disabled={!href} type="button" size="sm" variant="outline" onClick={onRemove} title="Retirer le lien">
                                <Unlink className="mr-2 h-4 w-4" />
                                Retirer
                            </Button>
                            <div className="flex gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={closeLinkDialog}>
                                    Annuler
                                </Button>
                                <Button type="button" size="sm" onClick={onSave} disabled={!href || loadingSave}>
                                    Enregistrer
                                    <Spinner className={loadingSave ? "ml-2" : "hidden"} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
