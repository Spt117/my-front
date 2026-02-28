// LinkControls.tsx — bouton + modale lien avec recherche produit/collection
"use client";
import { searchProductsShopify } from "@/app/shopify/[shopId]/collections/server";
import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import { updateProduct } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import { Button } from "@/components/ui/button";
import { ProductGET } from "@/library/types/graph";
import type { Editor } from "@tiptap/react";
import { FolderOpen, Link2, Package, Search, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useShopifyStore from "../shopify/shopifyStore";
import { Spinner } from "../ui/shadcn-io/spinner/index";
import useEditorHtmlStore from "./storeEditor";
import { formatHTML } from "./utils";

type SearchResult =
    | { type: "product"; id: string; title: string; handle: string }
    | { type: "collection"; id: string; title: string; handle: string };

export function LinkControls({ editor }: { editor: Editor }) {
    const { linkDialogOpen, openLinkDialog, closeLinkDialog } = useEditorHtmlStore();
    const { product, shopifyBoutique } = useShopifyStore();
    const { collections } = useCollectionStore();
    const router = useRouter();

    const [loadingSave, setLoadingSave] = useState(false);
    const [href, setHref] = useState("");
    const [title, setTitle] = useState("");
    const [newTab, setNewTab] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Ouvre la modale en pré-remplissant si le focus est sur un lien
    const onOpen = () => {
        const isOnLink = editor.isActive("link");
        const attrs = editor.getAttributes("link") ?? {};
        setHref(isOnLink ? attrs.href ?? "" : "");
        setTitle(isOnLink ? attrs.title ?? "" : "");
        setNewTab(isOnLink ? attrs.target === "_blank" : false);
        setSearchQuery("");
        setSearchResults([]);
        openLinkDialog();
    };

    // Recherche avec debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            if (!shopifyBoutique) return;
            setIsSearching(true);
            try {
                const q = searchQuery.toLowerCase();

                // Collections : filtre local (déjà chargées dans le store)
                const collectionResults: SearchResult[] = collections
                    .filter((c) => c.title.toLowerCase().includes(q))
                    .slice(0, 5)
                    .map((c) => ({ type: "collection", id: c.id, title: c.title, handle: c.handle }));

                // Produits : appel API
                const data = await searchProductsShopify(shopifyBoutique.domain, searchQuery.trim());
                const productResults: SearchResult[] = ((data.response as ProductGET[]) ?? [])
                    .slice(0, 8)
                    .map((p) => ({ type: "product", id: p.id, title: p.title, handle: p.handle }));

                setSearchResults([...productResults, ...collectionResults]);
            } catch {
                // Silencieux — la recherche n'est pas critique
            } finally {
                setIsSearching(false);
            }
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, shopifyBoutique, collections]);

    const onSelectResult = (result: SearchResult) => {
        const base = `https://${shopifyBoutique?.publicDomain}`;
        const path = result.type === "product" ? `/products/${result.handle}` : `/collections/${result.handle}`;
        setHref(base + path);
        if (!title) setTitle(result.title);
        setSearchQuery("");
        setSearchResults([]);
    };

    const onSave = async () => {
        if (!href.trim()) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            closeLinkDialog();
            return;
        }

        const attrs: { href: string; title?: string; target?: string } = { href: href.trim() };
        if (title.trim()) attrs.title = title.trim();
        if (newTab) attrs.target = "_blank";

        editor.chain().focus().extendMarkRange("link").unsetLink().setLink(attrs).run();

        try {
            if (!product || !shopifyBoutique) {
                toast.error("Impossible de sauvegarder le lien : produit ou boutique introuvable.");
                closeLinkDialog();
                return;
            }
            setLoadingSave(true);
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
                    <div className="absolute inset-0 bg-black/40" onClick={closeLinkDialog} />
                    <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-4 shadow-xl">
                        <div className="mb-3">
                            <h3 className="text-base font-semibold">{editor.isActive("link") ? "Modifier le lien" : "Ajouter un lien"}</h3>
                            <p className="text-xs text-slate-500">Lien appliqué à la sélection actuelle. Laissez vide pour retirer.</p>
                        </div>

                        <div className="space-y-3">
                            {/* URL manuelle */}
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

                            {/* Recherche produit / collection */}
                            <div>
                                <span className="mb-1 block text-xs font-medium text-slate-600">Rechercher un produit ou une collection</span>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Titre du produit ou de la collection…"
                                        className="w-full rounded-md border pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {isSearching && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" />}
                                </div>

                                {/* Résultats */}
                                {searchResults.length > 0 && (
                                    <ul className="mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-md">
                                        {searchResults.map((r) => (
                                            <li
                                                key={r.id}
                                                onClick={() => onSelectResult(r)}
                                                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                            >
                                                {r.type === "product" ? (
                                                    <Package className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                ) : (
                                                    <FolderOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                )}
                                                <span className="truncate flex-1">{r.title}</span>
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                    {r.type === "product" ? "Produit" : "Collection"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                                    <p className="mt-1 text-xs text-slate-400 text-center py-2">Aucun résultat</p>
                                )}
                            </div>

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
