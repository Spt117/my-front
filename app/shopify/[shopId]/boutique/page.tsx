"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Copyright, Globe, RotateCcw, Save, ShoppingBag, Store, Truck, MapPin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateShippingTranslation, updateShopSettings } from "./serverAction";

export default function ShopPage() {
    const { shopId } = useParams() as { shopId: string };
    const router = useRouter();
    const { shopSettings, shippingTranslation, shopifyBoutique: boutique } = useShopifyStore();

    const [amazonPartnerId, setAmazonPartnerId] = useState<string>("");
    const [amazonDomain, setAmazonDomain] = useState<string>("");
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    const [shippingTitle, setShippingTitle] = useState<string>("");
    const [isSavingShipping, setIsSavingShipping] = useState(false);

    useEffect(() => {
        console.log("shopSettings", shopSettings);
        if (shopSettings) {
            setAmazonPartnerId(shopSettings.amazonPartnerId || "");
            setAmazonDomain(shopSettings.amazonDomain || "");
            setGoogleMapsApiKey(shopSettings.googleMapsApiKey || "");
        }
    }, [shopSettings]);

    useEffect(() => {
        if (shippingTranslation) {
            setShippingTitle(shippingTranslation.value || "");
        }
    }, [shippingTranslation]);

    const handleCopy = (text: string, message: string = "Contenu copié !") => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(message);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!boutique) return;
        setIsSaving(true);
        try {
            await updateShopSettings(boutique.domain, {
                amazonPartnerId,
                amazonDomain,
                googleMapsApiKey,
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

    const handleSaveShipping = async () => {
        if (!boutique || !shippingTranslation) return;
        setIsSavingShipping(true);
        try {
            await updateShippingTranslation(boutique.domain, {
                resourceId: shippingTranslation.resourceId,
                locale: shippingTranslation.locale,
                key: shippingTranslation.key,
                value: shippingTitle,
                digest: shippingTranslation.digest,
            });
            toast.success("Traduction mise à jour avec succès");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la mise à jour de la traduction");
        } finally {
            setIsSavingShipping(false);
        }
    };

    const handleResetShipping = async () => {
        if (!boutique || !shippingTranslation) return;
        setIsSavingShipping(true);
        try {
            await updateShippingTranslation(boutique.domain, {
                resourceId: shippingTranslation.resourceId,
                locale: shippingTranslation.locale,
                key: shippingTranslation.key,
                value: "",
                digest: shippingTranslation.digest,
            });
            toast.success("Traduction réinitialisée");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la réinitialisation");
        } finally {
            setIsSavingShipping(false);
        }
    };

    if (!boutique) return <div>Boutique non trouvée</div>;

    const hasChanges = amazonPartnerId !== (shopSettings?.amazonPartnerId || "") || amazonDomain !== (shopSettings?.amazonDomain || "") || googleMapsApiKey !== (shopSettings?.googleMapsApiKey || "");
    const hasShippingChanges = shippingTitle !== (shippingTranslation?.value || "");

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
                            <div onClick={() => handleCopy(boutique.domain, "ID interne copié !")} className="group flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 -m-2 rounded-lg transition-colors">
                                <span className="text-sm font-medium text-slate-500 font-mono">{boutique.domain}</span>
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500 transition-colors" />}
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
                                <div className="flex w-full gap-2">
                                    <Input
                                        value={amazonPartnerId}
                                        onChange={(e) => setAmazonPartnerId(e.target.value)}
                                        placeholder="Ex: beyblade-21"
                                        className={`flex-1 bg-white border-slate-200 focus:ring-purple-500 transition-all ${amazonPartnerId !== (shopSettings?.amazonPartnerId || "") ? "border-amber-300 ring-1 ring-amber-100" : ""}`}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(amazonPartnerId, "Amazon Partner ID copié !")} title="Copier" className="shrink-0">
                                        <Copy className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    Domaine Amazon
                                </label>
                                <div className="flex w-full gap-2">
                                    <Input
                                        value={amazonDomain}
                                        onChange={(e) => setAmazonDomain(e.target.value)}
                                        placeholder="Ex: amazon.fr"
                                        className={`flex-1 bg-white border-slate-200 focus:ring-purple-500 transition-all ${amazonDomain !== (shopSettings?.amazonDomain || "") ? "border-amber-300 ring-1 ring-amber-100" : ""}`}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(amazonDomain, "Domaine Amazon copié !")} title="Copier" className="shrink-0">
                                        <Copy className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {hasChanges && <p className="text-[10px] text-amber-600 font-medium animate-pulse text-center">Modifications non enregistrées</p>}

                        <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2">
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

                {/* Colissimo Settings Card */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            Colissimo Paramètres
                        </CardTitle>
                        <CardDescription>Clé API pour Google Maps (Points Relais)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    Google Maps API Key
                                </label>
                                <div className="flex w-full gap-2">
                                    <Input
                                        value={googleMapsApiKey}
                                        onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                                        placeholder="Ex: AIzaSyD..."
                                        className={`flex-1 bg-white border-slate-200 focus:ring-red-500 transition-all ${googleMapsApiKey !== (shopSettings?.googleMapsApiKey || "") ? "border-amber-300 ring-1 ring-amber-100" : ""}`}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(googleMapsApiKey, "Clé API copiée !")} title="Copier" className="shrink-0">
                                        <Copy className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {googleMapsApiKey !== (shopSettings?.googleMapsApiKey || "") && <p className="text-[10px] text-amber-600 font-medium animate-pulse text-center">Modifications non enregistrées</p>}

                        <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2">
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

            {/* Shipping Translation Card */}
            {shippingTranslation && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-500" />
                            Titre de la méthode de livraison
                        </CardTitle>
                        <CardDescription>Traduction de l'intitulé de livraison dans le thème</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Titre affiché</label>
                                <Textarea
                                    value={shippingTitle}
                                    onChange={(e) => setShippingTitle(e.target.value)}
                                    placeholder="Ex: Livraison standard"
                                    rows={3}
                                    className={`bg-white border-slate-200 focus:ring-blue-500 transition-all resize-none ${hasShippingChanges ? "border-amber-300 ring-1 ring-amber-100" : ""}`}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clé locale</span>
                                    <p className="text-sm text-slate-400 font-mono">{shippingTranslation.key}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Locale</span>
                                    <p className="text-sm text-slate-400 font-mono">{shippingTranslation.locale}</p>
                                </div>
                            </div>
                        </div>

                        {hasShippingChanges && <p className="text-[10px] text-amber-600 font-medium animate-pulse text-center">Modifications non enregistrées</p>}

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleResetShipping} disabled={isSavingShipping} className="gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Défaut
                            </Button>
                            <Button onClick={handleSaveShipping} disabled={isSavingShipping || !hasShippingChanges} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2">
                                {isSavingShipping ? (
                                    <span className="flex items-center gap-2 italic">
                                        <Save className="w-4 h-4 animate-spin" />
                                        Enregistrement...
                                    </span>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Enregistrer
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
