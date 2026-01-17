"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { boutiques, TDomainsShopify } from "@/params/paramsShopify";
import { Check, Copy, Copyright, Globe, Save, ShoppingBag, Store } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateShopSettings } from "./serverAction";

export default function ShopPage() {
    const { shopId } = useParams() as { shopId: string };
    const router = useRouter();
    const { shopSettings } = useShopifyStore();
    const boutique = boutiques.find((b) => b.id.toString() === shopId);

    const [amazonPartnerId, setAmazonPartnerId] = useState<string>("");
    const [amazonDomain, setAmazonDomain] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        console.log("shopSettings", shopSettings);
        if (shopSettings) {
            setAmazonPartnerId(shopSettings.amazonPartnerId || "");
            setAmazonDomain(shopSettings.amazonDomain || "");
        }
    }, [shopSettings]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("ID interne copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!boutique) return;
        setIsSaving(true);
        try {
            await updateShopSettings(boutique.domain as TDomainsShopify, {
                amazonPartnerId,
                amazonDomain,
            });
            toast.success("Paramètres mis à jour avec succès");
            router.refresh(); // ✅ Rafraîchir les données serveur
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    if (!boutique) return <div>Boutique non trouvée</div>;

    const hasChanges = amazonPartnerId !== (shopSettings?.amazonPartnerId || "") || amazonDomain !== (shopSettings?.amazonDomain || "");

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Store className="w-8 h-8 text-purple-600" />
                    Configuration de la Boutique
                </h1>
                <p className="text-slate-500">Gérez les paramètres globaux et les identifiants Amazon de {boutique.publicDomain}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Information Card */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-purple-500" />
                            Détails Shopify
                        </CardTitle>
                        <CardDescription>Informations de base de votre boutique</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Domaine Public</span>
                            <span className="text-sm font-medium text-slate-700">{boutique.publicDomain}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identifiant Interne</span>
                            <div
                                onClick={() => handleCopy(boutique.domain)}
                                className="group flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 -m-2 rounded-lg transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-500 font-mono">{boutique.domain}</span>
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 pt-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendeur</span>
                            <span className="text-sm font-medium text-slate-700">{boutique.vendor}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Amazon Partner Card */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Copyright className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" className="w-5 h-5" alt="Amazon" />
                            Affiliation Amazon
                        </CardTitle>
                        <CardDescription>Identifiants de partenaire pour l'affiliation globale</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Copyright className="w-3.5 h-3.5 text-slate-400" />
                                    Amazon Partner ID (Tag)
                                </label>
                                <Input
                                    value={amazonPartnerId}
                                    onChange={(e) => setAmazonPartnerId(e.target.value)}
                                    placeholder="Ex: beyblade-21"
                                    className={`bg-white border-slate-200 focus:ring-purple-500 transition-all ${
                                        amazonPartnerId !== (shopSettings?.amazonPartnerId || "") ? "border-amber-300 ring-1 ring-amber-100" : ""
                                    }`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    Domaine Amazon
                                </label>
                                <Input
                                    value={amazonDomain}
                                    onChange={(e) => setAmazonDomain(e.target.value)}
                                    placeholder="Ex: amazon.fr"
                                    className={`bg-white border-slate-200 focus:ring-purple-500 transition-all ${
                                        amazonDomain !== (shopSettings?.amazonDomain || "") ? "border-amber-300 ring-1 ring-amber-100" : ""
                                    }`}
                                />
                            </div>
                        </div>

                        {hasChanges && <p className="text-[10px] text-amber-600 font-medium animate-pulse text-center">Modifications non enregistrées</p>}

                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-2 italic">
                                    <Save className="w-4 h-4 animate-spin" />
                                    Enregistrement...
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Enregistrer les réglages
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
