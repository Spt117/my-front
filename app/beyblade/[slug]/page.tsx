import { CountryFlag } from '@/app/components/CountryFlag';
import { AMAZON_MARKETPLACES, CountryCode } from '@/library/utils/amazon';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BeybladeProductManager from '../components/BeybladeProductManager';
import { ProductTitle } from '../components/ProductTitle';
import { beybladeService } from '../supabase/beyblade-service';

export default async function BeybladeProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Try to get by ID first
    let product = await beybladeService.getOne(slug);

    if (!product) {
        // Fallback: get by slug if not found by ID
        product = await beybladeService.getOneBySlug(slug);
    }

    if (!product) {
        notFound();
    }

    // Get adjacent products for navigation
    const { prev, next } = await beybladeService.getAdjacentProducts(product.id || slug);

    // Pour Supabase, les images sont stockées directement sous forme d'URL complètes
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const imageUrl = mainImage || null;

    const marketplaces = product.marketplaces || {};
    const activeCountries = Object.keys(marketplaces) as CountryCode[];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between mb-8 gap-4">
                    <Link 
                        href="/beyblade" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                        <span className="text-lg">←</span>
                        <span className="hidden sm:inline">Back to Database</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {prev ? (
                            <Link
                                href={`/beyblade/${prev.slug || prev.id}`}
                                className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-gray-400 hover:text-white transition-all"
                                title={prev.title}
                            >
                                <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                                <span className="hidden md:inline max-w-32 truncate">{prev.title}</span>
                                <span className="md:hidden">Prev</span>
                            </Link>
                        ) : (
                            <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-600 cursor-not-allowed">
                                <span className="text-lg">←</span>
                            </span>
                        )}

                        {next ? (
                            <Link
                                href={`/beyblade/${next.slug || next.id}`}
                                className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-gray-400 hover:text-white transition-all"
                                title={next.title}
                            >
                                <span className="md:hidden">Next</span>
                                <span className="hidden md:inline max-w-32 truncate">{next.title}</span>
                                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        ) : (
                            <span className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-600 cursor-not-allowed">
                                <span className="text-lg">→</span>
                            </span>
                        )}
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                    {/* Left Column: Image */}
                    <div className="relative aspect-square w-full max-w-lg mx-auto lg:mx-0 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        {imageUrl ? (
                            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">No Image Available</div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/10">{product.series}</span>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-blue-400 font-bold tracking-wider uppercase text-sm">{product.brand}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-emerald-400 font-mono text-sm">{product.productCode}</span>
                            </div>
                            <ProductTitle title={product.title} />
                            <div className="flex gap-4 text-sm text-gray-400">
                                <span>
                                    Released: <span className="text-gray-200">{product.releaseDate ? new Date(product.releaseDate).toLocaleDateString() : 'N/A'}</span>
                                </span>
                                <span>
                                    Type: <span className="text-gray-200">{product.releaseType}</span>
                                </span>
                                <span>
                                    ASIN: <span className="text-gray-200">{product.marketplaces?.JP?.asin}</span>
                                </span>
                            </div>
                        </div>

                        {product.product && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-gray-400 text-sm uppercase font-bold block mb-1">Product Type</span>
                                <span className="text-xl font-medium text-white">{product.product}</span>
                            </div>
                        )}

                        {/* Marketplaces Links */}
                        {activeCountries.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">Buy on Amazon</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeCountries.map((code: CountryCode) => {
                                        const data = marketplaces[code];
                                        if (!data || !data.asin) return null;
                                        const mpInfo = AMAZON_MARKETPLACES[code];

                                        return (
                                            <a
                                                key={code}
                                                href={`${mpInfo.url}/dp/${data.asin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all"
                                            >
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CountryFlag code={code} className="w-5 h-3.5 rounded shadow-sm" />
                                                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">Amazon {code}</span>
                                                    </div>
                                                    {data.price > 0 && (
                                                        <span className="text-green-400 font-mono text-sm">
                                                            {data.price} {data.currency}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-500 group-hover:translate-x-1 transition-transform">↗</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-white/10 text-gray-500 text-sm font-mono">ID: {product.id}</div>
                    </div>
                </div>

                {/* Management Section */}
                <div className="border-t border-white/10 pt-12">
                    <h2 className="text-3xl font-bold text-white mb-8">Amazon Marketplaces Management</h2>
                    <BeybladeProductManager product={product} />
                </div>
            </div>
        </div>
    );
}
