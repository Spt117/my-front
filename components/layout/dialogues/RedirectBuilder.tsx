"use client";
import { searchProductsShopify } from "@/app/shopify/[shopId]/collections/server";
import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Link2, Package, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type RedirectMode = "home" | "collection" | "product" | "custom";

export interface RedirectTarget {
    mode: RedirectMode;
    target: string; // chemin relatif ou URL absolue, prêt pour Shopify urlRedirectCreate
    label: string;  // libellé court pour aperçu humain
}

// Construit la cible et le label selon le mode + valeur saisie/sélectionnée.
function buildTarget(mode: RedirectMode, value: string, extra?: { collectionTitle?: string; productTitle?: string }): RedirectTarget | null {
    if (mode === "home") return { mode, target: "/", label: "Page d'accueil" };
    if (mode === "collection") {
        const handle = value.trim();
        if (!handle) return null;
        return { mode, target: `/collections/${handle}`, label: extra?.collectionTitle || handle };
    }
    if (mode === "product") {
        const handle = value.trim();
        if (!handle) return null;
        return { mode, target: `/products/${handle}`, label: extra?.productTitle || handle };
    }
    if (mode === "custom") {
        const t = value.trim();
        if (!t) return null;
        return { mode, target: t, label: t };
    }
    return null;
}

interface Props {
    onChange: (target: RedirectTarget | null) => void;
}

// Formulaire générique pour construire une cible de redirection unique
// (partagée par tous les produits supprimés). Notifie le parent à chaque
// changement via onChange (null = pas de cible définie).
export default function RedirectBuilder({ onChange }: Props) {
    const { shopifyBoutique } = useShopifyStore();
    const { collections } = useCollectionStore();
    const [mode, setMode] = useState<RedirectMode>("collection");

    // Collection (recherche locale dans le cache déjà chargé du store)
    const [collectionQuery, setCollectionQuery] = useState("");
    const [collectionHandle, setCollectionHandle] = useState<string>("");
    const [collectionTitle, setCollectionTitle] = useState<string>("");

    // Produit (recherche serveur debounced)
    const [productQuery, setProductQuery] = useState("");
    const [productResults, setProductResults] = useState<{ id: string; title: string; handle: string; featuredImage?: { url: string } | null }[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [productHandle, setProductHandle] = useState("");
    const [productTitle, setProductTitle] = useState("");

    // URL libre
    const [customUrl, setCustomUrl] = useState("");

    const collectionsOptions = useMemo(
        () => [...collections].sort((a, b) => a.title.localeCompare(b.title, "fr", { sensitivity: "base" })),
        [collections],
    );

    const filteredCollections = useMemo(() => {
        const q = collectionQuery.trim().toLowerCase();
        if (!q) return collectionsOptions.slice(0, 12);
        return collectionsOptions
            .filter((c) => c.title.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q))
            .slice(0, 12);
    }, [collectionsOptions, collectionQuery]);

    // Recherche produit (debounced)
    useEffect(() => {
        if (mode !== "product" || !shopifyBoutique?.domain) return;
        const q = productQuery.trim();
        if (!q || q.length < 2) {
            setProductResults([]);
            return;
        }
        setProductLoading(true);
        const t = setTimeout(async () => {
            try {
                const data = await searchProductsShopify(shopifyBoutique.domain, q);
                setProductResults((data.response as any[])?.slice(0, 8) || []);
            } finally {
                setProductLoading(false);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [productQuery, mode, shopifyBoutique?.domain]);

    // Notifie le parent dès qu'un changement est cohérent.
    useEffect(() => {
        let target: RedirectTarget | null = null;
        if (mode === "home") target = buildTarget("home", "");
        else if (mode === "collection") {
            target = buildTarget("collection", collectionHandle, { collectionTitle });
        } else if (mode === "product") {
            target = buildTarget("product", productHandle, { productTitle });
        } else if (mode === "custom") {
            target = buildTarget("custom", customUrl);
        }
        onChange(target);
    }, [mode, collectionHandle, collectionTitle, productHandle, productTitle, customUrl, onChange]);

    return (
        <div className="space-y-3">
            {/* Mode tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg">
                {[
                    { key: "collection" as RedirectMode, icon: <Tag size={13} />, label: "Collection" },
                    { key: "product" as RedirectMode, icon: <Package size={13} />, label: "Produit" },
                    { key: "home" as RedirectMode, icon: <Home size={13} />, label: "Accueil" },
                    { key: "custom" as RedirectMode, icon: <Link2 size={13} />, label: "URL libre" },
                ].map((opt) => (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => setMode(opt.key)}
                        className={`flex items-center justify-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-colors ${
                            mode === opt.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Mode body */}
            {mode === "home" && (
                <div className="text-sm text-slate-600 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
                    Toutes les redirections pointeront vers <code className="bg-white px-1 rounded text-xs">/</code> (page d&apos;accueil de la boutique).
                </div>
            )}

            {mode === "collection" && (
                <div className="space-y-1.5 w-full">
                    <Label htmlFor="redirect-collection">Collection cible</Label>
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <Input
                            id="redirect-collection"
                            value={collectionQuery}
                            onChange={(e) => {
                                setCollectionQuery(e.target.value);
                                setCollectionHandle("");
                                setCollectionTitle("");
                            }}
                            placeholder="Rechercher une collection…"
                            className="pl-8 w-full"
                        />
                    </div>
                    {collectionHandle && (
                        <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">
                            Sélectionné : <strong>{collectionTitle}</strong>{" "}
                            <span className="font-mono text-slate-500">/collections/{collectionHandle}</span>
                        </div>
                    )}
                    {!collectionHandle && filteredCollections.length > 0 && (
                        <ul className="border border-slate-200 rounded-md max-h-48 overflow-y-auto divide-y divide-slate-100 w-full">
                            {filteredCollections.map((c) => (
                                <li
                                    key={c.id}
                                    onClick={() => {
                                        setCollectionHandle(c.handle);
                                        setCollectionTitle(c.title);
                                        setCollectionQuery(c.title);
                                    }}
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
                                >
                                    <span className="truncate flex-1">{c.title}</span>
                                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[40%]">{c.handle}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {collectionsOptions.length === 0 && (
                        <p className="text-xs text-slate-400 italic">Aucune collection chargée pour cette boutique.</p>
                    )}
                </div>
            )}

            {mode === "product" && (
                <div className="space-y-1.5 w-full">
                    <Label htmlFor="redirect-product">Produit cible</Label>
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <Input
                            id="redirect-product"
                            value={productQuery}
                            onChange={(e) => {
                                setProductQuery(e.target.value);
                                setProductHandle("");
                                setProductTitle("");
                            }}
                            placeholder="Rechercher par titre ou SKU…"
                            className="pl-8 w-full"
                        />
                    </div>
                    {productHandle && (
                        <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">
                            Sélectionné : <strong>{productTitle}</strong> <span className="font-mono text-slate-500">/products/{productHandle}</span>
                        </div>
                    )}
                    {productLoading && <p className="text-xs text-slate-400">Recherche…</p>}
                    {!productHandle && productResults.length > 0 && (
                        <ul className="border border-slate-200 rounded-md max-h-48 overflow-y-auto divide-y divide-slate-100 w-full">
                            {productResults.map((p) => (
                                <li
                                    key={p.id}
                                    onClick={() => {
                                        setProductHandle(p.handle);
                                        setProductTitle(p.title);
                                        setProductResults([]);
                                        setProductQuery(p.title);
                                    }}
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
                                >
                                    <span className="truncate flex-1">{p.title}</span>
                                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[40%]">{p.handle}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {mode === "custom" && (
                <div className="space-y-1.5 w-full">
                    <Label htmlFor="redirect-custom">URL ou chemin relatif</Label>
                    <Input
                        id="redirect-custom"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="/collections/foo  ou  https://exemple.com"
                        className="w-full"
                    />
                    <p className="text-[11px] text-slate-500">
                        Chemin relatif (ex: <code>/collections/foo</code>) ou URL absolue (ex: <code>https://exemple.com</code>).
                    </p>
                </div>
            )}
        </div>
    );
}
