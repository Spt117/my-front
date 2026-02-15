"use client";

import { CountryFlag } from "@/app/components/CountryFlag";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { AMAZON_MARKETPLACES, COUNTRY_REGIONS, CountryCode, MarketplaceData } from "@/library/utils/amazon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateBeybladeProduct } from "../actions";
import { BeybladeProduct } from "../supabase/beyblade";

interface Props {
    product: BeybladeProduct;
}

export default function BeybladeProductManager({ product }: Props) {
    const router = useRouter();
    const [marketplaces, setMarketplaces] = useState<Partial<Record<CountryCode, MarketplaceData>>>(product.marketplaces || {});
    const [isSaving, setIsSaving] = useState(false);

    // New Entry State
    const [newAsin, setNewAsin] = useState("");
    const [selectedNewCountries, setSelectedNewCountries] = useState<CountryCode[]>([]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateBeybladeProduct(product.id!, { marketplaces });
        if (result.success) {
            router.refresh();
        } else {
            alert("Failed to save changes");
        }
        setIsSaving(false);
    };

    useKeyboardShortcuts("Enter", handleSave);

    // Sort based on ORIGINAL DB state to avoid jumping during edit
    const activeCountries = (Object.keys(marketplaces) as CountryCode[]).sort((a, b) => {
        const priceA = product.marketplaces?.[a]?.price || 0;
        const priceB = product.marketplaces?.[b]?.price || 0;

        // Put items with 0 price first
        if (priceA === 0 && priceB > 0) return -1;
        if (priceA > 0 && priceB === 0) return 1;

        return a.localeCompare(b);
    });

    const hasActiveMarketplaces = activeCountries.length > 0;

    const handleToggleNewCountry = (code: CountryCode) => {
        setSelectedNewCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
    };

    const handleSelectRegion = (region: string) => {
        const codes = COUNTRY_REGIONS[region];
        const allSelected = codes.every((c) => selectedNewCountries.includes(c));

        if (allSelected) {
            // Deselect all in region
            setSelectedNewCountries((prev) => prev.filter((c) => !codes.includes(c)));
        } else {
            // Select all in region (union)
            setSelectedNewCountries((prev) => Array.from(new Set([...prev, ...codes])));
        }
    };

    const handleAddAsinToSelected = () => {
        if (!newAsin.trim()) return;

        const updated = { ...marketplaces };
        selectedNewCountries.forEach((code) => {
            if (!updated[code]) {
                updated[code] = {
                    asin: newAsin,
                    price: 0,
                    currency: AMAZON_MARKETPLACES[code].currency,
                };
            } else {
                updated[code] = {
                    ...updated[code]!,
                    asin: newAsin,
                };
            }
        });

        setMarketplaces(updated);
        setNewAsin("");
        setSelectedNewCountries([]);
    };

    const handleUpdateField = (code: CountryCode, field: keyof MarketplaceData, value: string | number) => {
        const current = marketplaces[code];
        if (!current) return;

        setMarketplaces({
            ...marketplaces,
            [code]: {
                ...current,
                [field]: value,
            },
        });
    };

    const handleRemoveMarketplace = async (code: CountryCode) => {
        // Optimistic update
        const previousMarketplaces = { ...marketplaces };
        const updated = { ...marketplaces };
        delete updated[code];
        setMarketplaces(updated);

        setIsSaving(true);
        const result = await updateBeybladeProduct(product.id!, { marketplaces: updated });

        if (result.success) {
            router.refresh();
        } else {
            // Revert on failure
            setMarketplaces(previousMarketplaces);
            alert("Failed to remove marketplace");
        }
        setIsSaving(false);
    };

    const handleSelectAll = () => {
        const allCodes = Object.values(COUNTRY_REGIONS).flat();
        const allSelected = allCodes.every((c) => selectedNewCountries.includes(c));

        if (allSelected) {
            setSelectedNewCountries([]);
        } else {
            setSelectedNewCountries(allCodes);
        }
    };

    return (
        <div className="space-y-8">
            {/* Quick Add Section */}
            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="bg-blue-600 w-1 h-6 rounded-full block"></span>
                    Bulk Add by ASIN
                </h3>

                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">1. Enter ASIN</label>
                        <input
                            type="text"
                            value={newAsin}
                            onChange={(e) => setNewAsin(e.target.value)}
                            placeholder="e.g. B0CMZ..."
                            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-4">
                                <span>2. Select Marketplaces</span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/30 px-2 py-1 rounded transition-colors cursor-pointer"
                                >
                                    {Object.values(COUNTRY_REGIONS)
                                        .flat()
                                        .every((c) => selectedNewCountries.includes(c))
                                        ? "Deselect All"
                                        : "Select All"}
                                </button>
                            </label>

                            <span className="text-xs text-green-500 flex items-center gap-1.5 bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Already configured
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {Object.entries(COUNTRY_REGIONS).map(([region, codes]) => {
                                const isRegionSelected = codes.every((c) => selectedNewCountries.includes(c));
                                return (
                                    <div key={region} className="bg-black/20 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                            <span className="font-bold text-gray-300">{region}</span>
                                            <button onClick={() => handleSelectRegion(region)} className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                                                {isRegionSelected ? "None" : "All"}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {codes.map((code) => {
                                                const isConfigured = !!marketplaces[code];
                                                const isSelected = selectedNewCountries.includes(code);

                                                return (
                                                    <label
                                                        key={code}
                                                        className="flex items-center gap-2 cursor-pointer group select-none"
                                                        onClick={() => handleToggleNewCountry(code)}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                                isSelected
                                                                    ? "bg-blue-600 border-blue-600"
                                                                    : isConfigured
                                                                      ? "border-green-500/50 bg-green-500/10"
                                                                      : "border-gray-600 group-hover:border-gray-500"
                                                            }`}
                                                        >
                                                            {isSelected ? (
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                isConfigured && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CountryFlag code={code} className="w-4 h-3 rounded-[2px]" />
                                                            <span
                                                                className={`text-sm ${
                                                                    isSelected
                                                                        ? "text-white"
                                                                        : isConfigured
                                                                          ? "text-green-400 font-medium"
                                                                          : "text-gray-500 group-hover:text-gray-400"
                                                                }`}
                                                            >
                                                                {code}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleAddAsinToSelected}
                        disabled={!newAsin || selectedNewCountries.length === 0}
                        className="self-start py-3 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        Add ASIN to {selectedNewCountries.length} Marketplaces
                    </button>
                </div>
            </div>

            {/* Configured Marketplaces List */}
            {hasActiveMarketplaces && (
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="bg-green-600 w-1 h-6 rounded-full block"></span>
                            Configured Marketplaces
                        </h3>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="py-2 px-6 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save All Changes"
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeCountries.map((code) => {
                            const data = marketplaces[code];
                            if (!data) return null;
                            const mpInfo = AMAZON_MARKETPLACES[code];

                            const originalData = product.marketplaces?.[code];
                            // Check against DB value for highlighting
                            const isMissingPrice = !originalData?.price || originalData.price === 0;

                            return (
                                <div
                                    key={code}
                                    className={`rounded-xl p-4 border transition-colors group relative ${
                                        isMissingPrice ? "bg-orange-900/10 border-orange-500/50 hover:border-orange-400" : "bg-black/40 border-white/5 hover:border-white/10"
                                    }`}
                                >
                                    {isMissingPrice && (
                                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                            Price Missing
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleRemoveMarketplace(code)}
                                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10 cursor-pointer"
                                        title="Remove Marketplace"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    <div className="flex items-center justify-between mb-3 pr-8">
                                        <div className="flex items-center gap-3">
                                            <CountryFlag code={code} className="w-6 h-4 rounded shadow-sm" />
                                            <span className="font-bold text-lg text-gray-200">{code}</span>
                                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{mpInfo.currency}</span>
                                        </div>
                                        <a
                                            href={data.asin ? `${mpInfo.url}/dp/${data.asin}` : "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                                                !data.asin ? "opacity-50 pointer-events-none" : ""
                                            }`}
                                        >
                                            View Page
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </a>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold block mb-1">ASIN</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={data.asin}
                                                    onChange={(e) => handleUpdateField(code, "asin", e.target.value)}
                                                    className="w-full bg-gray-800 border-none rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-500 font-bold block mb-1">Price</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={data.price}
                                                    onChange={(e) => handleUpdateField(code, "price", parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-gray-800 border-none rounded px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 font-mono"
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-3 top-1.5 text-xs text-gray-500 pointer-events-none">{mpInfo.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
