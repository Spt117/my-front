'use client';

import { LineItemNode } from '@/library/shopify/orders';
import { boutiqueFromDomain, TDomainsShopify } from '@/params/paramsShopify';
import { Check, CheckCircle2, ExternalLink, Loader2, Package, RotateCcw, Truck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cancelFulfillment, fulfillLineItems, Fulfillment, FulfillmentOrder, getFulfillmentOrders, getFulfillments } from './serverAction';

interface FulfillProductSectionProps {
    lineItems: Array<{ node: LineItemNode }>;
    domain: TDomainsShopify;
    orderIds: string[];
    onOrderUpdated?: () => void;
}

interface SelectableLineItem {
    node: LineItemNode;
    fulfillmentOrderId: string;
    fulfillmentLineItemId: string;
    remainingQuantity: number;
    selected: boolean;
}

interface FulfilledItem {
    node: LineItemNode;
    fulfillmentId: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    trackingCompany: string | null;
}

export default function FulfillProductSection({ lineItems, domain, orderIds, onOrderUpdated }: FulfillProductSectionProps) {
    const router = useRouter();
    const boutique = boutiqueFromDomain(domain);
    const [loading, setLoading] = useState(true);
    const [fulfilling, setFulfilling] = useState(false);
    const [canceling, setCanceling] = useState<string | null>(null);
    const [selectableItems, setSelectableItems] = useState<SelectableLineItem[]>([]);
    const [fulfilledItems, setFulfilledItems] = useState<FulfilledItem[]>([]);
    const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [trackingCompany, setTrackingCompany] = useState('Colissimo');

    // Mapping des URLs de suivi par transporteur
    const trackingUrlTemplates: Record<string, string> = {
        Colissimo: 'https://www.laposte.fr/outils/suivre-vos-envois?code={tracking}',
        Chronopost: 'https://www.chronopost.fr/tracking-no-cms/suivi-page?liession={tracking}',
        'La Poste': 'https://www.laposte.fr/outils/suivre-vos-envois?code={tracking}',
        'Mondial Relay': 'https://www.mondialrelay.fr/suivi-de-colis/?NumeroExpedition={tracking}',
        DHL: 'https://www.dhl.com/fr-fr/home/suivi.html?tracking-id={tracking}',
        UPS: 'https://www.ups.com/track?tracknum={tracking}&loc=fr_FR',
        FedEx: 'https://www.fedex.com/fedextrack/?trknbr={tracking}',
        GLS: 'https://gls-group.eu/FR/fr/suivi-colis?match={tracking}',
        DPD: 'https://www.dpd.com/fr/fr/suivi-de-colis/?parcelno={tracking}',
        Other: '',
    };

    // Générer l'URL de suivi avec le numéro
    const getTrackingUrl = (company: string, number: string): string => {
        const template = trackingUrlTemplates[company] || '';
        if (!template || !number) return '';
        return template.replace('{tracking}', number);
    };

    // Mettre à jour l'URL quand le transporteur ou le numéro change
    const handleTrackingCompanyChange = (company: string) => {
        setTrackingCompany(company);
        setTrackingUrl(getTrackingUrl(company, trackingNumber));
    };

    const handleTrackingNumberChange = (number: string) => {
        setTrackingNumber(number);
        setTrackingUrl(getTrackingUrl(trackingCompany, number));
    };

    useEffect(() => {
        // Réinitialiser les états quand on change de commande
        setLoading(true);
        setMessage(null);
        setSelectableItems([]);
        setFulfilledItems([]);
        setTrackingNumber('');
        setTrackingUrl('');
        loadData();
    }, [orderIds.join(','), domain]);

    const loadData = async () => {
        try {
            // Charger les fulfillment orders et les fulfillments pour TOUTES les commandes du groupe
            const foPromises = orderIds.map((id) => getFulfillmentOrders(domain, id));
            const fPromises = orderIds.map((id) => getFulfillments(domain, id));

            const [foResults, fResults] = await Promise.all([Promise.all(foPromises), Promise.all(fPromises)]);

            // Agréger les fulfillment orders
            const allFulfillmentOrders: FulfillmentOrder[] = [];
            for (const res of foResults) {
                if (res?.fulfillmentOrders) {
                    allFulfillmentOrders.push(...res.fulfillmentOrders);
                }
            }

            // Agréger les fulfillments
            const allFulfillments: Fulfillment[] = [];
            for (const res of fResults) {
                if (res) allFulfillments.push(...res);
            }

            setFulfillments(allFulfillments);

            if (allFulfillmentOrders.length === 0 && foResults.some((r) => !r)) {
                setMessage({ type: 'error', text: 'Impossible de charger les données de fulfillment' });
                setLoading(false);
                return;
            }

            // Filtrer les fulfillment orders (on prend tout ce qui n'est pas CLOSED ou CANCELLED)
            const activeFulfillmentOrders = allFulfillmentOrders.filter((fo) => {
                const s = (fo.status || '').toUpperCase();
                return s !== 'CLOSED' && s !== 'CANCELLED' && s !== 'CANCELED';
            });

            // DEBUG: Log des données pour diagnostic
            console.log('=== DEBUG FulfillProductSection ===');
            console.log('lineItems:', lineItems);
            console.log('allFulfillmentOrders:', allFulfillmentOrders);
            console.log('activeFulfillmentOrders:', activeFulfillmentOrders);
            console.log('allFulfillments:', allFulfillments);
            console.log('===================================');

            const selectable: SelectableLineItem[] = [];
            const fulfilled: FulfilledItem[] = [];
            const processedLineItems = new Set<string>();

            // Aide pour comparer les IDs Shopify de manière robuste (compare uniquement la partie numérique)
            const getNumericId = (gid: string) => gid.split('/').pop()?.split('?')[0] || gid;

            // 1. D'abord on identifie tout ce qui est sélectionnable via les FO ouverts
            for (const { node } of lineItems) {
                const nodeNumericId = getNumericId(node.id);
                const nodeSku = (node.sku || '').trim().toLowerCase();
                const nodeTitle = (node.title || '').trim().toLowerCase();

                let found = false;
                for (const fo of activeFulfillmentOrders) {
                    const foLineItem = fo.lineItems.find((li) => {
                        const liNumericId = getNumericId(li.lineItemId);
                        const liSku = (li.sku || '').trim().toLowerCase();

                        // Stratégie de matching :
                        // 1. ID numérique identique
                        if (liNumericId && nodeNumericId && liNumericId === nodeNumericId) return true;
                        // 2. SKU identique (si présent)
                        if (liSku && nodeSku && liSku === nodeSku) return true;

                        return false;
                    });

                    if (foLineItem) {
                        selectable.push({
                            node,
                            fulfillmentOrderId: fo.id,
                            fulfillmentLineItemId: foLineItem.id,
                            remainingQuantity: foLineItem.remainingQuantity,
                            selected: false,
                        });
                        processedLineItems.add(node.id);
                        found = true;
                        break;
                    }
                }
            }

            // 2. Ensuite on identifie tout ce qui est déjà traité
            for (const { node } of lineItems) {
                if (processedLineItems.has(node.id)) continue;

                const isFulfilled = (node.fulfillmentStatus || '').toLowerCase() === 'fulfilled';

                if (isFulfilled) {
                    const fulfillment = allFulfillments.find((f) => f.status === 'SUCCESS' || f.status === 'fulfilled') || allFulfillments[0];
                    const tNumber = fulfillment?.trackingInfo || null;
                    const tCompany = fulfillment?.trackingCompany || 'Colissimo';

                    fulfilled.push({
                        node,
                        fulfillmentId: fulfillment?.id || '',
                        trackingNumber: tNumber,
                        trackingCompany: tCompany,
                        trackingUrl: tNumber ? getTrackingUrl(tCompany, tNumber) : null,
                    });
                    processedLineItems.add(node.id);
                }
            }

            // 3. Cas particulier: si un item n'est ni selectable ni fulfilled
            // On l'ajoute quand même en "selectable" (mais sans fulfillmentOrderId/id pour bloquer le bouton)
            // ou on pourrait créer un autre état. Pour l'instant, on l'affiche simplement pour éviter l'écran vide.
            for (const { node } of lineItems) {
                if (processedLineItems.has(node.id)) {
                    continue;
                }
                // Si on arrive ici, l'item est "perdu". On l'ajoute aux sélectionnables
                // mais il n'aura pas de fulfillmentOrderId donc on ne pourra pas le traiter.
                // Cela permet au moins de voir le produit.
                selectable.push({
                    node,
                    fulfillmentOrderId: '',
                    fulfillmentLineItemId: '',
                    remainingQuantity: node.quantity,
                    selected: false,
                });
            }

            setSelectableItems(selectable);
            setFulfilledItems(fulfilled);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement' });
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (index: number) => {
        const item = selectableItems[index];
        if (!item.fulfillmentOrderId) return; // Empêcher la sélection si pas d'ID de fulfillment
        setSelectableItems((prev) => prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)));
    };

    const selectAll = () => {
        setSelectableItems((prev) => prev.map((item) => (item.fulfillmentOrderId ? { ...item, selected: true } : item)));
    };

    const deselectAll = () => {
        setSelectableItems((prev) => prev.map((item) => ({ ...item, selected: false })));
    };

    const handleFulfill = async () => {
        const selectedItems = selectableItems.filter((item) => item.selected);
        if (selectedItems.length === 0) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un produit' });
            return;
        }

        setFulfilling(true);
        setMessage(null);

        try {
            const result = await fulfillLineItems({
                domain,
                orderId: orderIds[0],
                lineItems: selectedItems.map((item) => ({
                    fulfillmentOrderId: item.fulfillmentOrderId,
                    lineItemId: item.fulfillmentLineItemId,
                    quantity: item.remainingQuantity,
                })),
                trackingInfo: trackingNumber
                    ? {
                          number: trackingNumber,
                          url: trackingUrl || undefined,
                          company: trackingCompany || undefined,
                      }
                    : undefined,
            });

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else if (result.response) {
                if (result.response.archived) {
                    setMessage({
                        type: 'success',
                        text: '✅ Tous les produits traités ! Commande archivée.',
                    });
                    setTimeout(() => {
                        router.push(`/shopify/${boutique.id}/orders`);
                        router.refresh();
                    }, 2000);
                } else {
                    setMessage({
                        type: 'success',
                        text: `${selectedItems.length} produit(s) traité(s) avec succès`,
                    });
                    await loadData();
                    onOrderUpdated?.();
                }
            }
        } catch (error) {
            console.error('Erreur lors du fulfillment:', error);
            setMessage({ type: 'error', text: 'Erreur lors du traitement' });
        } finally {
            setFulfilling(false);
        }
    };

    const handleCancelFulfillment = async (fulfillmentId: string) => {
        if (!fulfillmentId) {
            setMessage({ type: 'error', text: "Impossible d'annuler ce fulfillment" });
            return;
        }

        setCanceling(fulfillmentId);
        setMessage(null);

        try {
            const result = await cancelFulfillment(domain, fulfillmentId);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Fulfillment annulé avec succès' });
                await loadData();
                onOrderUpdated?.();
            }
        } catch (error) {
            console.error("Erreur lors de l'annulation:", error);
            setMessage({ type: 'error', text: "Erreur lors de l'annulation" });
        } finally {
            setCanceling(null);
        }
    };

    const selectedCount = selectableItems.filter((item) => item.selected).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-gray-600">Chargement des produits...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Message */}
            {message && (
                <div
                    className={`p-4 rounded-xl flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-lg">⚠️</span>}
                    {message.text}
                </div>
            )}

            {/* Section Produits à traiter */}
            {selectableItems.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-500" />
                        Produits à traiter ({selectableItems.length})
                    </h4>

                    {/* Tracking Info Section */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-800">Informations de suivi (optionnel)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Numéro de suivi</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                                    placeholder="Ex: 8R12345678901"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Transporteur</label>
                                <select
                                    value={trackingCompany}
                                    onChange={(e) => handleTrackingCompanyChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white"
                                >
                                    <option value="Colissimo">Colissimo</option>
                                    <option value="Chronopost">Chronopost</option>
                                    <option value="La Poste">La Poste</option>
                                    <option value="Mondial Relay">Mondial Relay</option>
                                    <option value="DHL">DHL</option>
                                    <option value="UPS">UPS</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="GLS">GLS</option>
                                    <option value="DPD">DPD</option>
                                    <option value="Other">Autre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">URL de suivi (auto-remplie)</label>
                                <input
                                    type="text"
                                    value={trackingUrl}
                                    onChange={(e) => setTrackingUrl(e.target.value)}
                                    placeholder="Générée automatiquement"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectAll}
                                className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                                Tout sélectionner
                            </button>
                            <button
                                onClick={deselectAll}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Tout désélectionner
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                                {selectedCount} / {selectableItems.length} sélectionné(s)
                            </span>
                            <button
                                onClick={handleFulfill}
                                disabled={selectedCount === 0 || fulfilling}
                                className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg ${
                                    selectedCount > 0 && !fulfilling
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200 cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                            >
                                {fulfilling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <Package className="w-4 h-4" />
                                        Marquer comme traité
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectableItems.map((item, index) => (
                            <div
                                key={item.node.id}
                                onClick={() => toggleSelection(index)}
                                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    item.selected ? 'border-green-400 bg-green-50/50 shadow-lg shadow-green-100' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                }`}
                            >
                                <div
                                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                        item.selected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}
                                >
                                    <Check className="w-4 h-4" />
                                </div>

                                <div className="relative w-16 h-16 min-w-[4rem] rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                    <Image
                                        src={item.node.variant?.product?.featuredImage?.url || '/no_image.png'}
                                        alt={item.node.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0 pr-8">
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.node.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-bold text-gray-600">{item.node.sku || 'SANS SKU'}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-xs font-bold text-indigo-600">x{item.remainingQuantity}</span>
                                        {!item.fulfillmentOrderId && (
                                            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[10px] font-bold text-orange-700 animate-pulse">DÉTAILS API MANQUANTS</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Section Produits traités */}
            {fulfilledItems.length > 0 && (
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Produits déjà traités ({fulfilledItems.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fulfilledItems.map((item) => (
                            <div key={item.node.id} className="relative flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 bg-green-50/30 transition-all">
                                {/* Badge traité */}
                                <div className="absolute top-2 right-2">
                                    <span className="px-2 py-0.5 rounded-md bg-green-100 text-xs font-bold text-green-700">✓ Traité</span>
                                </div>

                                <div className="relative w-16 h-16 min-w-[4rem] rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                    <Image
                                        src={item.node.variant?.product?.featuredImage?.url || '/no_image.png'}
                                        alt={item.node.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0 pr-20">
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.node.title}</h4>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-bold text-gray-600">{item.node.sku}</span>
                                        {item.trackingNumber &&
                                            (item.trackingUrl ? (
                                                <a
                                                    href={item.trackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2 py-0.5 rounded-md bg-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Truck className="w-3 h-3" />
                                                    {item.trackingNumber}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-xs font-medium text-blue-700 flex items-center gap-1">
                                                    <Truck className="w-3 h-3" />
                                                    {item.trackingNumber}
                                                </span>
                                            ))}
                                    </div>
                                    {item.fulfillmentId && (
                                        <button
                                            onClick={() => handleCancelFulfillment(item.fulfillmentId)}
                                            disabled={canceling === item.fulfillmentId}
                                            className="mt-2 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                            {canceling === item.fulfillmentId ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Annulation...
                                                </>
                                            ) : (
                                                <>
                                                    <RotateCcw className="w-3 h-3" />
                                                    Annuler le traitement
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message si aucun produit */}
            {selectableItems.length === 0 && fulfilledItems.length === 0 && (
                <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-600">Aucun produit à afficher</p>
                </div>
            )}
        </div>
    );
}
