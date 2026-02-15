"use client";

import { IconLoader2, IconPackage, IconPlus, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createBeybladeProduct } from "../../beycommunity/actions";

const PRODUCT_TYPES = ["", "Starter", "Booster", "Triple Booster", "Customize Set", "Deck Set", "Random Booster", "Launcher", "Grip", "Battle Set", "Entry Set", "Stadium", "Accessory"];

const RELEASE_TYPES = ["regular", "Corocoro", "Lottery", "Tournament", "Limited", "Collaboration"];

const SERIES = ["Basic Line", "Unique Line", "Custom Line", "X Over Project"];

const BRANDS = ["Takara Tomy", "Hasbro"];

export function DevProductCreator() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        productCode: "",
        slug: "",
        brand: "Takara Tomy",
        product: "",
        releaseType: "regular",
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

    const handleCreate = () => {
        if (!form.title || !form.productCode || !form.slug) {
            setError("Titre, Code Produit et Slug sont requis");
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }

        setError(null);
        startTransition(async () => {
            const result = await createBeybladeProduct(form as any);

            if (result.success) {
                toast.success("Produit créé avec succès !");
                setForm({
                    title: "",
                    productCode: "",
                    slug: "",
                    brand: "Takara Tomy",
                    product: "",
                    releaseType: "regular",
                    series: "Basic Line",
                });
                setIsOpen(false);
                router.refresh();
            } else {
                setError(result.error || "Erreur lors de la création");
                toast.error("Erreur lors de la création du produit");
            }
        });
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/40 active:scale-95 border border-blue-400/30 group cursor-pointer">
                <IconPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Créer un Produit
            </button>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                        <IconPackage size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Nouveau Produit</h3>
                        <p className="text-slate-400 text-xs">Ajouter une référence à Beyblade X</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
                    <IconX size={20} />
                </button>
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

                {/* productCode */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Code Produit (SKU)</label>
                    <input
                        type="text"
                        placeholder="Ex: BX-01"
                        value={form.productCode}
                        onChange={(e) => setForm({ ...form, productCode: e.target.value })}
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
