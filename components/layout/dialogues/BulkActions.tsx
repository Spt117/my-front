"use client";
import { actionBulk, addProductsToCollection } from "@/app/shopify/[shopId]/bulk/server";
import useBulkStore from "@/app/shopify/[shopId]/bulk/storeBulk";
import TagAutocomplete from "@/app/shopify/[shopId]/bulk/TagAutocomplete";
import useCollectionStore from "@/app/shopify/[shopId]/collections/storeCollections";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { BulkAction } from "@/components/shopify/typesShopify";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import useUserStore from "@/library/stores/storeUser";
import { CheckCircle2, FolderPlus, Rocket, Tag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ActionId = "quick_publish" | "add_to_collection" | "add_tag" | "remove_tag";

const ACTIONS: { id: ActionId; label: string; description: string; icon: React.ReactNode; accent: keyof typeof ACCENT }[] = [
    { id: "quick_publish", label: "Publication rapide", description: "Statut Actif + tous les canaux", icon: <Rocket size={18} />, accent: "emerald" },
    { id: "add_to_collection", label: "Ajouter à une collection", description: "Cible une collection manuelle", icon: <FolderPlus size={18} />, accent: "blue" },
    { id: "add_tag", label: "Ajouter un tag", description: "Sur tous les produits sélectionnés", icon: <Tag size={18} />, accent: "violet" },
    { id: "remove_tag", label: "Supprimer un tag", description: "Retire le tag s'il est présent", icon: <Tag size={18} />, accent: "rose" },
];

const ACCENT = {
    emerald: { card: "border-slate-200 hover:border-emerald-300", cardSelected: "border-emerald-500 bg-emerald-50/60", panel: "border-emerald-200 bg-emerald-50/40", iconBg: "bg-emerald-100", iconText: "text-emerald-600" },
    blue: { card: "border-slate-200 hover:border-blue-300", cardSelected: "border-blue-500 bg-blue-50/60", panel: "border-blue-200 bg-blue-50/40", iconBg: "bg-blue-100", iconText: "text-blue-600" },
    violet: { card: "border-slate-200 hover:border-violet-300", cardSelected: "border-violet-500 bg-violet-50/60", panel: "border-violet-200 bg-violet-50/40", iconBg: "bg-violet-100", iconText: "text-violet-600" },
    rose: { card: "border-slate-200 hover:border-rose-300", cardSelected: "border-rose-500 bg-rose-50/60", panel: "border-rose-200 bg-rose-50/40", iconBg: "bg-rose-100", iconText: "text-rose-600" },
};

export default function BulkActions() {
    const { closeDialog, shopifyBoutique, canauxBoutique } = useShopifyStore();
    const { collections } = useCollectionStore();
    const { selectedProducts } = useBulkStore();
    const { socket } = useUserStore();
    const router = useRouter();

    const [action, setAction] = useState<ActionId | null>(null);
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [tag, setTag] = useState<string>("");
    const [serverSuggestions, setServerSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const productIds = useMemo(() => selectedProducts.map((p) => p.id), [selectedProducts]);
    const collectionsOptions = useMemo(() => collections.filter((c) => !c.ruleSet).map((c) => ({ label: c.title, value: c.id })), [collections]);

    // Tags présents dans la sélection (utilisé par remove_tag)
    const tagsInSelection = useMemo(() => {
        const set = new Set<string>();
        for (const p of selectedProducts) for (const t of p.tags || []) if (t) set.add(t);
        return Array.from(set).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
    }, [selectedProducts]);

    // Reset des champs au changement d'action
    useEffect(() => {
        setTag("");
        setServerSuggestions([]);
    }, [action]);

    // Listener socket pour les suggestions server-side (add_tag)
    useEffect(() => {
        if (!socket) return;
        const handler = (tags: string[]) => setServerSuggestions(tags || []);
        socket.on("tagSuggestions", handler);
        return () => {
            socket.off("tagSuggestions", handler);
        };
    }, [socket]);

    // Demande debounced de suggestions quand on tape en add_tag
    useEffect(() => {
        if (action !== "add_tag" || !socket || !shopifyBoutique?.domain) return;
        const q = tag.trim();
        if (!q) {
            setServerSuggestions([]);
            return;
        }
        const timer = setTimeout(() => socket.emit("searchTags", q, shopifyBoutique.domain), 250);
        return () => clearTimeout(timer);
    }, [tag, action, socket, shopifyBoutique?.domain]);

    // Suggestions locales pour remove_tag (uniquement ce qui existe vraiment dans la sélection)
    const removeSuggestions = useMemo(() => {
        const q = tag.trim().toLowerCase();
        return q ? tagsInSelection.filter((t) => t.toLowerCase().includes(q)) : tagsInSelection;
    }, [tag, tagsInSelection]);

    const canExecute = () => {
        if (!action) return false;
        if (action === "quick_publish") return true;
        if (action === "add_to_collection") return !!collectionId;
        if (action === "add_tag" || action === "remove_tag") return !!tag.trim();
        return false;
    };

    const handleAction = async () => {
        if (!shopifyBoutique?.domain || !action) return;
        setLoading(true);
        try {
            switch (action) {
                case "quick_publish": {
                    const canauxIds = canauxBoutique.map((c) => c.id);
                    const payload: BulkAction = { productsId: productIds, domain: shopifyBoutique.domain, actionType: "quick_publish", canauxIds };
                    const res = await actionBulk(payload);
                    if (res.error) toast.error(res.error);
                    if (res.message) toast.success(res.message);
                    closeDialog();
                    router.refresh();
                    break;
                }
                case "add_to_collection": {
                    if (!collectionId) return;
                    const res = await addProductsToCollection(shopifyBoutique.domain, collectionId, productIds);
                    if (res.error) toast.error(res.error);
                    if (res.message) {
                        toast.success(res.message);
                        router.push(`/shopify/${shopifyBoutique.id}/collections/${collectionId.replace("gid://shopify/Collection/", "")}`);
                        closeDialog();
                    }
                    break;
                }
                case "add_tag":
                case "remove_tag": {
                    const t = tag.trim();
                    if (!t) return;
                    const payload: BulkAction = { productsId: productIds, domain: shopifyBoutique.domain, actionType: "tag", tag: t, type: action === "add_tag" ? "add" : "remove" };
                    const res = await actionBulk(payload);
                    if (res.error) toast.error(res.error);
                    if (res.message) toast.success(res.message);
                    closeDialog();
                    break;
                }
            }
        } catch (error) {
            console.error("Error during bulk action:", error);
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const selectedAction = ACTIONS.find((a) => a.id === action);
    const accent = selectedAction ? ACCENT[selectedAction.accent] : ACCENT.blue;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Actions en masse</h2>
                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-blue-500" />
                        <strong className="text-slate-700">{selectedProducts.length}</strong> produit{selectedProducts.length > 1 ? "s" : ""} sélectionné{selectedProducts.length > 1 ? "s" : ""}
                    </p>
                </div>
                <button onClick={closeDialog} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" aria-label="Fermer">
                    <X size={18} />
                </button>
            </div>

            {/* Action picker — cartes 2x2 */}
            <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map((a) => {
                    const acc = ACCENT[a.accent];
                    const isActive = action === a.id;
                    return (
                        <button
                            key={a.id}
                            type="button"
                            onClick={() => setAction(a.id)}
                            className={`text-left rounded-xl border-2 p-3 transition-all cursor-pointer ${isActive ? acc.cardSelected : `${acc.card} bg-white`}`}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${acc.iconBg} ${acc.iconText}`}>{a.icon}</div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-800">{a.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">{a.description}</div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Configuration contextuelle */}
            {action && (
                <div className={`rounded-xl border-2 ${accent.panel} p-4 space-y-2`}>
                    {action === "quick_publish" && (
                        <div className="flex items-start gap-3 text-sm">
                            <Rocket size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="text-slate-700">
                                Les <strong>{selectedProducts.length}</strong> produit{selectedProducts.length > 1 ? "s" : ""} passeront en statut <strong className="text-emerald-700">Actif</strong> et seront publiés sur les{" "}
                                <strong>{canauxBoutique.length}</strong> canal{canauxBoutique.length > 1 ? "ux" : ""} de la boutique.
                            </div>
                        </div>
                    )}

                    {action === "add_to_collection" && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Collection cible</label>
                            <Selecteur className="w-full" array={collectionsOptions} onChange={(value) => setCollectionId(value)} placeholder="Sélectionner une collection manuelle" value={collectionId} />
                            <p className="text-xs text-slate-500 mt-1.5">Seules les collections manuelles (sans règle automatique) sont listées.</p>
                        </div>
                    )}

                    {action === "add_tag" && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Tag à ajouter</label>
                            <TagAutocomplete
                                value={tag}
                                onChange={setTag}
                                suggestions={serverSuggestions}
                                placeholder="Tape pour proposer un tag existant ou en créer un nouveau"
                                leftIcon={<Tag size={15} />}
                            />
                            <p className="text-xs text-slate-500 mt-1.5">Suggestions issues des tags déjà utilisés sur la boutique.</p>
                        </div>
                    )}

                    {action === "remove_tag" && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Tag à supprimer</label>
                            <TagAutocomplete
                                value={tag}
                                onChange={setTag}
                                suggestions={removeSuggestions}
                                placeholder={tagsInSelection.length > 0 ? `Choisir parmi ${tagsInSelection.length} tag${tagsInSelection.length > 1 ? "s" : ""} de la sélection…` : "Aucun tag dans la sélection"}
                                leftIcon={<Tag size={15} />}
                                disabled={tagsInSelection.length === 0}
                            />
                            {tagsInSelection.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {tagsInSelection.slice(0, 10).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTag(t)}
                                            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                                                tag === t ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                    {tagsInSelection.length > 10 && <span className="text-[11px] text-slate-400 self-center">+{tagsInSelection.length - 10}</span>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
                <Button type="button" size="sm" variant="outline" onClick={closeDialog} disabled={loading}>
                    Annuler
                </Button>
                <Button type="button" size="sm" disabled={loading || !canExecute()} onClick={handleAction}>
                    {loading ? (
                        <>
                            <Spinner className="mr-2" />
                            En cours…
                        </>
                    ) : (
                        "Confirmer"
                    )}
                </Button>
            </div>
        </div>
    );
}
