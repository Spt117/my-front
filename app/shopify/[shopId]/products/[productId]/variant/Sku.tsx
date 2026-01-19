import CopyComponent from "@/components/Copy";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Barcode, KeySquare, Save, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { syncSkuAcrossShops, updateSkuLocal, updateVariant } from "../serverAction";
import useVariantStore from "../storeVariant";
import { cssCard } from "../util";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { useRouter } from "next/navigation";

export default function Sku() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { sku, setSku, barcode, setBarcode, weight, setWeight, weightUnit, setWeightUnit } = useVariantStore();
    const [loading, setLoading] = useState(false);
    const variant = product?.variants?.nodes[0];
    const router = useRouter();

    useEffect(() => {
        if (variant) {
            if (variant.sku) setSku(variant.sku);
            if (variant.barcode) setBarcode(variant.barcode);
            if (variant.inventoryItem?.measurement?.weight?.value) setWeight(variant.inventoryItem.measurement.weight.value);
            if (variant.inventoryItem?.measurement?.weight?.unit) setWeightUnit(variant.inventoryItem.measurement.weight.unit);
        }
    }, [variant, setSku, setBarcode, setWeight, setWeightUnit]);

    if (!product || !variant || !shopifyBoutique) return null;

    // Detection des changements
    const hasSkuChanged = sku !== (variant.sku || "");
    const hasBarcodeChanged = barcode !== (variant.barcode || "");
    const hasWeightChanged = weight !== (variant.inventoryItem?.measurement?.weight?.value || 0);
    const hasUnitChanged = weightUnit !== (variant.inventoryItem?.measurement?.weight?.unit || "GRAMS");

    const activeSave = (hasSkuChanged || hasBarcodeChanged || hasWeightChanged || hasUnitChanged) && !loading;

    const handleSave = async () => {
        if (!activeSave) return;
        setLoading(true);
        try {
            const promises = [];

            // Si le SKU a changé et que c'est une boutique Beyblade, synchroniser avec les autres boutiques
            if (hasSkuChanged) {
                const isBeybladeBoutique = shopifyBoutique.niche === "beyblade";
                const oldSku = variant.sku || "";

                if (isBeybladeBoutique && oldSku) {
                    // Utiliser la synchronisation multi-boutiques
                    const syncResult = await syncSkuAcrossShops(
                        shopifyBoutique.domain,
                        oldSku,
                        sku,
                        variant.id,
                        product.id
                    );

                    if (syncResult?.response) {
                        const result = syncResult.response;
                        
                        if (result.sourceUpdated) {
                            toast.success(`SKU mis à jour sur ${shopifyBoutique.publicDomain}`);
                        }

                        // Afficher les résultats pour les autres boutiques
                        result.otherShops?.forEach((shop: any) => {
                            if (shop.updated) {
                                toast.success(`SKU synchronisé sur ${shop.domain.split('.')[0]}`);
                            } else {
                                toast.error(`Échec sync ${shop.domain.split('.')[0]}: ${shop.error || 'Erreur'}`);
                            }
                        });

                        // Signaler les boutiques où le produit n'existe pas
                        result.notFoundOn?.forEach((domain: string) => {
                            toast.info(`Produit non trouvé sur ${domain.split('.')[0]}`, {
                                description: "SKU non synchronisé sur cette boutique",
                                duration: 4000,
                            });
                        });
                    } else if (syncResult?.error) {
                        toast.error(syncResult.error);
                    }
                } else {
                    // Boutique non-Beyblade ou pas d'ancien SKU : mise à jour simple
                    promises.push(updateSkuLocal(shopifyBoutique.domain, variant.id, sku));
                    promises.push(updateVariant(shopifyBoutique.domain, product.id, variant.id, "sku", sku));
                }
            }

            if (hasBarcodeChanged) {
                promises.push(updateVariant(shopifyBoutique.domain, product.id, variant.id, "barcode", barcode));
            }

            if (hasWeightChanged || hasUnitChanged) {
                promises.push(updateVariant(shopifyBoutique.domain, product.id, variant.id, "weight", weight, {
                    inventoryItemId: variant.inventoryItem.id,
                    weightUnit: weightUnit
                }));
            }

            if (promises.length > 0) {
                const results = await Promise.all(promises);
                const errors = results.filter((r: any) => r?.error);
                
                if (errors.length > 0) {
                    errors.forEach((e: any) => toast.error(e.error));
                } else if (!hasSkuChanged || shopifyBoutique.niche !== "beyblade") {
                    // Message générique si pas de sync SKU Beyblade
                    toast.success("Informations de variante mises à jour !");
                }
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
            console.error(error);
        } finally {
            setLoading(false);
            router.refresh();
        }
    };

    useKeyboardShortcuts("Enter", () => handleSave());

    const weightUnits = [
        { label: "Grammes (g)", value: "GRAMS" },
        { label: "Kilogrammes (kg)", value: "KILOGRAMS" },
        { label: "Onces (oz)", value: "OUNCES" },
        { label: "Livres (lb)", value: "POUNDS" },
    ];

    return (
        <Card className={cssCard + " relative"}>
            <CardContent className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                        <KeySquare size={16} />
                        Référence & Poids
                    </h3>
                    <div className="flex items-center gap-2">
                        {activeSave && !loading && (
                            <button 
                                onClick={handleSave} 
                                className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm border border-blue-200"
                                title="Enregistrer les modifications"
                            >
                                <Save size={18} />
                            </button>
                        )}
                        {loading && <Spinner size={18} className="text-blue-600" />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SKU */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            SKU
                        </label>
                        <div className="relative group">
                            <Input 
                                type="text" 
                                value={sku} 
                                onChange={(e) => setSku(e.target.value)} 
                                className={`pr-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${hasSkuChanged ? 'border-amber-300 ring-1 ring-amber-100' : ''}`}
                                placeholder="Non défini"
                            />
                            <CopyComponent contentToCopy={sku} className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity" message="SKU copié !" size={16} />
                        </div>
                    </div>

                    {/* Barcode */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Barcode size={12} />
                            Code-barres
                        </label>
                        <div className="relative group">
                            <Input 
                                type="text" 
                                value={barcode} 
                                onChange={(e) => setBarcode(e.target.value)} 
                                className={`pr-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${hasBarcodeChanged ? 'border-amber-300 ring-1 ring-amber-100' : ''}`}
                                placeholder="EAN / UPC"
                            />
                            <CopyComponent contentToCopy={barcode} className="absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity" message="Code-barres copié !" size={16} />
                        </div>
                    </div>
                </div>

                {/* Weight */}
                <div className="pt-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Weight size={12} />
                        Poids physique
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input 
                                type="number" 
                                value={weight} 
                                onChange={(e) => setWeight(Number(e.target.value))} 
                                className={`bg-gray-50/50 border-gray-200 focus:bg-white transition-all ${hasWeightChanged ? 'border-amber-300 ring-1 ring-amber-100' : ''}`}
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="w-[140px]">
                            <Selecteur 
                                array={weightUnits}
                                value={weightUnit}
                                onChange={setWeightUnit}
                                placeholder="Unité"
                                className={hasUnitChanged ? 'border-amber-300 ring-1 ring-amber-100' : ''}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
