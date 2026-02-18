"use client";

import { IconLoader2, IconPackage, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createBeybladeProduct } from "../../beycommunity/actions";
import { AMAZON_MARKETPLACES, CountryCode } from "@/library/utils/amazon";

const PRODUCT_TYPES = ["", "Starter", "Booster", "Triple Booster", "Customize Set", "Deck Set", "Random Booster", "Launcher", "Grip", "Battle Set", "Entry Set", "Stadium", "Accessory"];

const RELEASE_TYPES = ["Regular", "Corocoro", "Lottery", "Tournament", "Limited", "Collaboration"];

const SERIES = ["Basic Line", "Unique Line", "Custom Line", "X Over Project"];

const BRANDS = ["Takara Tomy", "Hasbro"];

const ALL_MARKETPLACES = Object.keys(AMAZON_MARKETPLACES) as CountryCode[];

interface AsinRow {
    marketplace: CountryCode;
    asin: string;
    price: string;
}

export function DevProductCreator() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [asins, setAsins] = useState<AsinRow[]>([]);

    const [form, setForm] = useState({
        title: "",
        sku: "",
        slug: "",
        brand: "Takara Tomy",
        product: "",
        releaseType: "Regular",
        series: "Basic Line",
    });

    // Génère automatiquement le slug à partir du type de produit + titre
    const generateSlug = (productType: string, title: string) => {
        const parts = [productType, title].filter(Boolean).join(" ");
        return parts
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    };

    const updateTitle = (title: string) => {
        setForm({
            ...form,
            title,
            slug: generateSlug(form.product, title),
        });
    };

    const updateProductType = (product: string) => {
        setForm({
            ...form,
            product,
            slug: generateSlug(product, form.title),
        });
    };

    const addAsin = () => setAsins([...asins, { marketplace: "US", asin: "", price: "" }]);

    const removeAsin = (index: number) => setAsins(asins.filter((_, i) => i !== index));

    const updateAsin = (index: number, field: keyof AsinRow, value: string) => {
        setAsins(asins.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const handleCreate = () => {
        if (!form.title || !form.sku || !form.slug) {
            setError("Titre, SKU et Slug sont requis");
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }

        const invalidAsin = asins.find((a) => !a.asin.trim());
        if (invalidAsin) {
            setError("Tous les ASINs doivent être renseignés");
            toast.error("Veuillez remplir tous les champs ASIN");
            return;
        }

        setError(null);
        startTransition(async () => {
            const asinPayload = asins
                .filter((a) => a.asin.trim())
                .map((a) => ({
                    marketplace: a.marketplace,
                    asin: a.asin.trim().toUpperCase(),
                    price: a.price ? parseFloat(a.price) : 0,
                }));

            const result = await createBeybladeProduct(form as any, asinPayload);

            if (result.success) {
                toast.success("Produit créé avec succès !");
                setForm({
                    title: "",
                    sku: "",
                    slug: "",
                    brand: "Takara Tomy",
                    product: "",
                    releaseType: "Regular",
                    series: "Basic Line",
                });
                setAsins([]);
                router.refresh();
            } else {
                setError(result.error || "Erreur lors de la création");
                toast.error("Erreur lors de la création du produit");
            }
        });
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                    <IconPackage size={22} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Nouveau Produit</h3>
                    <p className="text-slate-400 text-xs">Ajouter une référence à Beyblade X</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Titre */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Titre</label>
                    <input
                        type="text"
                        placeholder="Ex: BX-01 Starter Dran Sword 3-60F"
                        value={form.title}
                        onChange={(e) => updateTitle(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* SKU */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">SKU</label>
                    <input
                        type="text"
                        placeholder="Ex: BX-01"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder:text-slate-600"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Slug (URL)</label>
                    <input
                        type="text"
                        placeholder="ex: bx-01-starter-dran-sword"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder:text-slate-600"
                    />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Marque</label>
                    <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                        {BRANDS.map((b) => (
                            <option key={b} value={b} className="bg-slate-900">
                                {b}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Product Type */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Type de produit</label>
                    <select value={form.product} onChange={(e) => updateProductType(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                        {PRODUCT_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-slate-900">
                                {t || "— Aucun —"}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Release Type */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Type de sortie</label>
                    <select
                        value={form.releaseType}
                        onChange={(e) => setForm({ ...form, releaseType: e.target.value })}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                        {RELEASE_TYPES.map((rt) => (
                            <option key={rt} value={rt} className="bg-slate-900">
                                {rt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Series */}
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Série</label>
                    <select value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                        {SERIES.map((s) => (
                            <option key={s} value={s} className="bg-slate-900">
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ASINs */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">ASINs Amazon</label>
                    <button
                        type="button"
                        onClick={addAsin}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                        <IconPlus size={13} />
                        Ajouter un ASIN
                    </button>
                </div>

                {asins.length > 0 && (
                    <div className="space-y-2">
                        {asins.map((row, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <select
                                    value={row.marketplace}
                                    onChange={(e) => updateAsin(index, "marketplace", e.target.value)}
                                    className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer w-24 shrink-0"
                                >
                                    {ALL_MARKETPLACES.map((code) => (
                                        <option key={code} value={code} className="bg-slate-900">
                                            {code}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="ASIN (ex: B0CXXXXXXXXX)"
                                    value={row.asin}
                                    maxLength={10}
                                    onChange={(e) => updateAsin(index, "asin", e.target.value)}
                                    className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                                />
                                <input
                                    type="number"
                                    placeholder="Prix"
                                    value={row.price}
                                    min={0}
                                    step={0.01}
                                    onChange={(e) => updateAsin(index, "price", e.target.value)}
                                    className="w-28 shrink-0 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAsin(index)}
                                    className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer shrink-0"
                                >
                                    <IconTrash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold animate-in shake duration-300">{error}</div>}

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleCreate}
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-black font-black uppercase tracking-tighter rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group shadow-lg shadow-white/5 active:scale-95"
                >
                    {isPending ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} className="group-hover:rotate-90 transition-transform duration-300" />}
                    Confirmer la création
                </button>
            </div>
        </div>
    );
}
