"use client";

import { AMAZON_MARKETPLACES, CountryCode, MarketplaceData } from "@/library/utils/amazon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateBeybladeProduct } from "../actions";
import { BeybladeProduct } from "../supabase/beyblade";

interface BeybladeListProps {
    products: BeybladeProduct[];
    pbUrl: string;
}

export default function BeybladeList({ products: initialProducts, pbUrl }: BeybladeListProps) {
    const [products, setProducts] = useState(initialProducts);
    const router = useRouter();

    const handleUpdateMarketplaces = async (productId: string, marketplaces: Partial<Record<CountryCode, MarketplaceData>>) => {
        const result = await updateBeybladeProduct(productId, { marketplaces });
        if (result.success) {
            // Update local state to reflect changes or wait for router refresh
            setProducts(products.map((p) => (p.id === productId ? { ...p, marketplaces } : p)));
            router.refresh();
        } else {
            alert("Error updating product");
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            {products.map((product) => (
                <ProductRow key={product.id} product={product} onUpdate={handleUpdateMarketplaces} pbUrl={pbUrl} />
            ))}
        </div>
    );
}

function ProductRow({
    product,
    onUpdate,
    pbUrl,
}: {
    product: BeybladeProduct;
    onUpdate: (id: string, data: Partial<Record<CountryCode, MarketplaceData>>) => void;
    pbUrl: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    // Local state for edits before saving
    const [marketplaces, setMarketplaces] = useState<Partial<Record<CountryCode, MarketplaceData>>>(product.marketplaces || {});
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>("FR"); // Default to FR

    const availableCountries = Object.keys(AMAZON_MARKETPLACES) as CountryCode[];

    const activeCountries = Object.keys(marketplaces) as CountryCode[];

    const handleAddCountry = () => {
        if (!marketplaces[selectedCountry]) {
            setMarketplaces({
                ...marketplaces,
                [selectedCountry]: { asin: "", price: 0, currency: AMAZON_MARKETPLACES[selectedCountry].currency },
            });
        }
    };

    const handleChange = (country: CountryCode, field: keyof MarketplaceData, value: string | number) => {
        const current = marketplaces[country] || { asin: "", price: 0, currency: AMAZON_MARKETPLACES[country].currency };
        setMarketplaces({
            ...marketplaces,
            [country]: {
                ...current,
                [field]: value,
            },
        });
    };

    const handleSave = () => {
        onUpdate(product.id || "", marketplaces);
        setIsEditing(false);
    };

    const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const imageUrl = mainImage?.url || null;

    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex flex-col md:flex-row items-stretch md:items-center p-4 gap-4 md:h-32">
                {/* Image Section */}
                <Link href={`/beyblade/${product.id}`} className="block relative w-full md:w-24 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No Img</div>
                    )}
                </Link>

                {/* Content Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <Link href={`/beyblade/${product.id}`} className="hover:text-blue-400 transition-colors">
                        <h3 className="text-lg font-bold text-gray-100 truncate">{product.title}</h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">{product.series}</span>
                        <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">{product.brand}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">{product.productCode}</span>
                    </div>
                </div>

                {/* Actions / Metrics Section if needed, here just the edit button */}
                <div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
                    <div className="flex gap-2">
                        {/* Marketplace badges/icons could go here */}
                        {activeCountries.slice(0, 3).map((c) => (
                            <span key={c} className="text-xs font-mono bg-gray-800 px-1 rounded text-gray-400">
                                {c}
                            </span>
                        ))}
                        {activeCountries.length > 3 && <span className="text-xs text-gray-500">+{activeCountries.length - 3}</span>}
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="py-1.5 px-3 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                        {isEditing ? "Close" : "Manage Amazon"}
                    </button>
                </div>
            </div>

            {/* Editing Panel (Expandable) */}
            <div className={`overflow-hidden transition-all duration-500 bg-black/20 ${isEditing ? "max-h-[1000px] border-t border-white/5" : "max-h-0"}`}>
                <div className="p-4 space-y-4">
                    <div className="flex gap-2 max-w-md">
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {availableCountries.map((code) => (
                                <option key={code} value={code}>
                                    {code} - {AMAZON_MARKETPLACES[code].currency}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleAddCountry} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-bold">
                            Add
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeCountries.map((code) => {
                            const data = marketplaces[code];
                            if (!data) return null;
                            return (
                                <div key={code} className="bg-gray-800/80 rounded-lg p-3 border border-white/5 space-y-2 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-blue-400">{code}</span>
                                            <span className="text-xs text-gray-500">{data.currency}</span>
                                        </div>
                                        <a
                                            href={`${AMAZON_MARKETPLACES[code].url}/dp/${data.asin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-xs text-gray-400 hover:text-white ${!data.asin ? "pointer-events-none opacity-50" : ""}`}
                                        >
                                            View ↗
                                        </a>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <input
                                                type="text"
                                                value={data.asin}
                                                onChange={(e) => handleChange(code, "asin", e.target.value)}
                                                placeholder="ASIN"
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                value={data.price}
                                                onChange={(e) => handleChange(code, "price", parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02]"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
