"use client";

import { IconShoppingCart, IconClock, IconLoader2, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { IShopifyPublicationRecordFull, PublicationStatus } from "@/library/pocketbase/ShopifyPublicationService";
import { getBeybladePublications } from "@/app/beycommunity/actions";

const STATUS_CONFIG: Record<PublicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "En attente", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: <IconClock size={14} /> },
    processing: { label: "En cours", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: <IconLoader2 size={14} className="animate-spin" /> },
    done: { label: "Terminé", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <IconCheck size={14} /> },
    error: { label: "Erreur", color: "text-rose-400 bg-rose-400/10 border-rose-400/20", icon: <IconAlertTriangle size={14} /> },
};

export function ShopifyPublicationsList() {
    const [publications, setPublications] = useState<IShopifyPublicationRecordFull[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBeybladePublications()
            .then(setPublications)
            .finally(() => setLoading(false));
    }, []);

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
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
                    {publications.length}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                            <th className="pb-3 pl-1">ASIN</th>
                            <th className="pb-3">Marketplace</th>
                            <th className="pb-3">Shop</th>
                            <th className="pb-3">Statut</th>
                            <th className="pb-3">Erreur</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {publications.map((pub) => {
                            const status = STATUS_CONFIG[pub.status];
                            return (
                                <tr key={pub.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 pl-1 font-mono text-white">{pub.asin}</td>
                                    <td className="py-3 text-slate-300 uppercase">{pub.marketplace}</td>
                                    <td className="py-3 text-slate-400 truncate max-w-[200px]">{pub.shop}</td>
                                    <td className="py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${status.color}`}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="py-3 text-rose-400/70 text-xs truncate max-w-[250px]">{pub.error || "—"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
