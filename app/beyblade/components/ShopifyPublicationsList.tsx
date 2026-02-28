"use client";

import { createBeybladeOnShop, getAmazonAffiliationPrice, getBeybladePublications, updateAsinPrice, AsinRecord, ShopifyPublicationWithContent } from "@/app/beycommunity/actions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { IShopifyBase } from "@/library/pocketbase/ShopifyBoutiqueService";
import { PublicationStatus } from "@/library/pocketbase/ShopifyPublicationService";
import { IconAlertTriangle, IconBrandAmazon, IconCheck, IconClock, IconDatabase, IconDatabaseOff, IconLoader2, IconPlus, IconShoppingCart, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const STATUS_CONFIG: Record<PublicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "En attente", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: <IconClock size={14} /> },
    processing: { label: "En cours", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <IconLoader2 size={14} className="animate-spin" /> },
    done: { label: "Terminé", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <IconCheck size={14} /> },
    error: { label: "Erreur", color: "text-rose-400 bg-rose-400/10 border-rose-400/20", icon: <IconAlertTriangle size={14} /> },
};

// ex: "amazon.fr" → "FR", "amazon.de" → "DE", "amazon.com" → "US"
function amazonDomainToMarketplace(amazonDomain: string): string {
    const tld = amazonDomain.split(".").at(-1) ?? "";
    if (tld === "com") return "US";
    if (tld === "uk") return "UK";
    return tld.toUpperCase();
}

function shopToMarketplace(shop: string, boutiques: IShopifyBase[]): string | null {
    const boutique = boutiques.find((b) => b.domain === shop);
    if (!boutique) return null;
    return amazonDomainToMarketplace(boutique.marketplaceAmazon);
}

function asinUrl(marketplace: string, asin: string, boutiques: IShopifyBase[]): string {
    const boutique = boutiques.find((b) => amazonDomainToMarketplace(b.marketplaceAmazon) === marketplace);
    const domain = boutique?.marketplaceAmazon ?? "amazon.com";
    return `https://www.${domain}/dp/${asin}`;
}

function marketplaceDevise(marketplace: string, boutiques: IShopifyBase[]): string {
    const boutique = boutiques.find((b) => amazonDomainToMarketplace(b.marketplaceAmazon) === marketplace);
    return boutique?.devise ?? "€";
}

function getDefaultTags(pub: ShopifyPublicationWithContent): string[] {
    const tags = ["Xtreme"];
    if (pub.beybladePackType) tags.push(pub.beybladePackType);
    if (pub.beybladeType) tags.push(pub.beybladeType);
    return tags;
}

function TagsEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
    const [input, setInput] = useState("");

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
        setInput("");
    };

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs border border-slate-600">
                    {tag}
                    <button onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-slate-500 hover:text-rose-400 transition-colors">
                        <IconX size={10} />
                    </button>
                </span>
            ))}
            <div className="flex items-center gap-1">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    placeholder="+ tag"
                    className="bg-transparent text-slate-400 text-xs placeholder:text-slate-600 outline-none w-16"
                />
                <button onClick={addTag} className="text-slate-500 hover:text-emerald-400 transition-colors">
                    <IconPlus size={12} />
                </button>
            </div>
        </div>
    );
}

export function ShopifyPublicationsList() {
    const { allBoutiques } = useShopifyStore();
    const boutiques = allBoutiques ?? [];
    const [publications, setPublications] = useState<ShopifyPublicationWithContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState<Record<string, string>>({});
    const [tags, setTags] = useState<Record<string, string[]>>({});
    const [creating, setCreating] = useState<Record<string, boolean>>({});
    const [createResults, setCreateResults] = useState<Record<string, { success: boolean; error?: string }>>({});
    const [affiliations, setAffiliations] = useState<Record<string, boolean>>({});
    const [affiliationLoading, setAffiliationLoading] = useState<Record<string, boolean>>({});
    const [affiliationErrors, setAffiliationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        getBeybladePublications()
            .then((pubs) => {
                setPublications(pubs);
                const initialTags: Record<string, string[]> = {};
                pubs.forEach((p) => {
                    initialTags[p.id] = getDefaultTags(p);
                });
                setTags(initialTags);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleToggleAffiliation = async (pub: ShopifyPublicationWithContent, checked: boolean) => {
        setAffiliations((prev) => ({ ...prev, [pub.id]: checked }));
        setAffiliationErrors((prev) => { const next = { ...prev }; delete next[pub.id]; return next; });

        if (!checked) return;

        const market = shopToMarketplace(pub.shop, boutiques);
        const matchedAsin = market ? pub.supabaseAsins.find((a) => a.marketplace === market) ?? null : null;

        if (!matchedAsin) return;

        // Prix déjà dispo dans Supabase → on l'injecte directement
        if (matchedAsin.price != null && matchedAsin.price > 0) {
            setPrices((prev) => ({ ...prev, [pub.id]: Number(matchedAsin.price).toFixed(2) }));
            return;
        }

        // Pas de prix → on fetch sur Amazon
        const boutique = boutiques.find((b) => b.domain === pub.shop);
        const amazonMarketplace = boutique?.marketplaceAmazon ?? pub.marketplace;

        setAffiliationLoading((prev) => ({ ...prev, [pub.id]: true }));
        const result = await getAmazonAffiliationPrice(matchedAsin.asin, amazonMarketplace);
        setAffiliationLoading((prev) => ({ ...prev, [pub.id]: false }));

        if (result.price !== null) {
            setPrices((prev) => ({ ...prev, [pub.id]: result.price!.toFixed(2) }));
            updateAsinPrice(matchedAsin.id, result.price);
        } else {
            setAffiliationErrors((prev) => ({ ...prev, [pub.id]: result.error ?? "Prix indisponible" }));
            setAffiliations((prev) => ({ ...prev, [pub.id]: false }));
        }
    };

    const handleCreate = async (pub: ShopifyPublicationWithContent) => {
        const price = prices[pub.id]?.trim();
        if (!price) return;

        setCreating((prev) => ({ ...prev, [pub.id]: true }));
        setCreateResults((prev) => {
            const next = { ...prev };
            delete next[pub.id];
            return next;
        });

        const result = await createBeybladeOnShop({
            publicationId: pub.id,
            sku: pub.sku,
            shop: pub.shop,
            price,
            tags: tags[pub.id] ?? getDefaultTags(pub),
        });

        setCreateResults((prev) => ({ ...prev, [pub.id]: result }));
        setCreating((prev) => ({ ...prev, [pub.id]: false }));

        if (result.success) {
            setPublications((prev) => prev.map((p) => (p.id === pub.id ? { ...p, status: "done" as PublicationStatus } : p)));
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-400">
                        <IconShoppingCart size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Publications Shopify</h3>
                        <p className="text-slate-400 text-xs">Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (publications.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-400">
                        <IconShoppingCart size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Publications Shopify</h3>
                        <p className="text-slate-400 text-xs">File d'attente des publications Beyblade</p>
                    </div>
                </div>
                <p className="text-slate-500 text-sm">Aucune publication en cours.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-400">
                        <IconShoppingCart size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Publications Shopify</h3>
                        <p className="text-slate-400 text-xs">File d'attente des publications Beyblade</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">{publications.length}</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                            <th className="pb-3 pl-1">ASINs</th>
                            <th className="pb-3">SKU</th>
                            <th className="pb-3">Shop</th>
                            <th className="pb-3">Statut</th>
                            <th className="pb-3">Erreur</th>
                            <th className="pb-3">Contenu</th>
                            <th className="pb-3">Créer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {publications.map((pub) => {
                            const status = STATUS_CONFIG[pub.status];
                            const canCreate = pub.hasContent && pub.status !== "done";
                            const isCreating = creating[pub.id] ?? false;
                            const createResult = createResults[pub.id];
                            const market = shopToMarketplace(pub.shop, boutiques);
                            const matchedAsin = market ? pub.supabaseAsins.find((a) => a.marketplace === market) ?? null : null;
                            const hasAsin = matchedAsin !== null;

                            return (
                                <tr key={pub.id} className="hover:bg-slate-800/30 transition-colors align-top">
                                    <td className="py-3 pl-1 max-w-[260px]">
                                        {(() => {
                                            const market = shopToMarketplace(pub.shop, boutiques);
                                            const matched = market
                                                ? pub.supabaseAsins.find((a: AsinRecord) => a.marketplace === market)
                                                : null;
                                            if (matched) {
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase w-8 shrink-0">{matched.marketplace}</span>
                                                        <a href={asinUrl(matched.marketplace, matched.asin, boutiques)} target="_blank" rel="noreferrer" className="font-mono text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2 transition-colors">
                                                            {matched.asin}
                                                        </a>
                                                        {matched.price != null && (
                                                            <span className="text-slate-400 text-[10px]">{matched.price}{marketplaceDevise(matched.marketplace, boutiques)}</span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return <span className="text-slate-600 text-xs">—</span>;
                                        })()}
                                    </td>
                                    <td className="py-3 font-mono text-slate-300 text-xs">{pub.sku || "—"}</td>
                                    <td className="py-3 text-slate-400 truncate max-w-[200px]">{pub.shop}</td>
                                    <td className="py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${status.color}`}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="py-3 text-rose-400/70 text-xs truncate max-w-[250px]">{pub.error || "—"}</td>
                                    <td className="py-3">
                                        {pub.hasContent ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-400">
                                                <IconDatabase size={14} />
                                                <span className="text-xs font-bold">Oui</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-slate-500">
                                                <IconDatabaseOff size={14} />
                                                <span className="text-xs">Non</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 min-w-[220px]">
                                        {canCreate ? (
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-1.5 cursor-pointer group w-fit">
                                                    <input
                                                        type="checkbox"
                                                        checked={affiliations[pub.id] ?? false}
                                                        disabled={affiliationLoading[pub.id] || !hasAsin}
                                                        onChange={(e) => handleToggleAffiliation(pub, e.target.checked)}
                                                        className="w-3 h-3 accent-orange-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                    />
                                                    <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-slate-300 text-xs transition-colors">
                                                        {affiliationLoading[pub.id] ? (
                                                            <IconLoader2 size={11} className="animate-spin text-orange-400" />
                                                        ) : (
                                                            <IconBrandAmazon size={11} />
                                                        )}
                                                        Affiliation
                                                    </span>
                                                </label>
                                                {affiliationErrors[pub.id] && (
                                                    <p className="text-rose-400 text-[10px]">{affiliationErrors[pub.id]}</p>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="29.90"
                                                        value={prices[pub.id] ?? ""}
                                                        onChange={(e) => setPrices((prev) => ({ ...prev, [pub.id]: e.target.value }))}
                                                        className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs placeholder:text-slate-600 outline-none focus:border-orange-500"
                                                    />
                                                    <span className="text-slate-500 text-xs">€</span>
                                                </div>
                                                <TagsEditor tags={tags[pub.id] ?? getDefaultTags(pub)} onChange={(t) => setTags((prev) => ({ ...prev, [pub.id]: t }))} />
                                                <button
                                                    onClick={() => handleCreate(pub)}
                                                    disabled={isCreating || !prices[pub.id]?.trim()}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-lg text-orange-400 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {isCreating ? (
                                                        <>
                                                            <IconLoader2 size={12} className="animate-spin" /> Création...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconShoppingCart size={12} /> Créer
                                                        </>
                                                    )}
                                                </button>
                                                {createResult && <p className={`text-xs ${createResult.success ? "text-emerald-400" : "text-rose-400"}`}>{createResult.success ? "✓ Créé" : createResult.error}</p>}
                                            </div>
                                        ) : pub.status === "done" ? (
                                            <span className="text-emerald-400/60 text-xs">—</span>
                                        ) : (
                                            <span className="text-slate-600 text-xs">Pas de contenu</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
