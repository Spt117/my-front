'use client';

import { Card } from '@/components/ui/card';
import { useCopy } from '@/library/hooks/useCopy';
import { ShopifyCustomer } from '@/library/shopify/clients';
import { boutiqueFromDomain } from '@/params/paramsShopify';
import * as Flags from 'country-flag-icons/react/3x2';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import { ArrowRight, Mail, MapPin, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

export default function ClientCompact({ client }: { client: ShopifyCustomer }) {
    const { handleCopy } = useCopy();
    const boutique = boutiqueFromDomain(client.shop!);

    return (
        <div className="container mx-auto px-4 py-0.5">
            <Card className="overflow-hidden border-0 shadow-sm bg-white/60 backdrop-blur-xl ring-1 ring-black/5 hover:bg-white/80 transition-all duration-300">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                    {/* Client Info */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0">
                            <div className="bg-blue-50 text-blue-600 rounded-full p-2 w-10 h-10 flex items-center justify-center border border-blue-100 shadow-sm">
                                <User size={20} />
                            </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                            <Link href={`/shopify/${boutique.id}/clients/${client.id.split('/').pop()}`} className="group/title">
                                <h3 className="text-sm font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors flex items-center gap-2 truncate">
                                    {client.firstName} {client.lastName}
                                    <ArrowRight className="w-3 h-3 text-gray-300 opacity-0 -translate-x-1 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:text-blue-600" />
                                </h3>
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate hover:text-blue-600 cursor-pointer" onClick={() => handleCopy(client.email)}>
                                    {client.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Location */}
                    <div className="flex items-center gap-6 shrink-0">
                        {/* Location */}
                        {client.defaultAddress && (
                            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                                <MapPin size={12} className="text-gray-400" />
                                <span>
                                    {client.defaultAddress.city}, {client.defaultAddress.country}
                                </span>
                                {(() => {
                                    const code = countries.getAlpha2Code(client.defaultAddress.country, 'fr') || countries.getAlpha2Code(client.defaultAddress.country, 'en');
                                    const FlagComponent = code ? Flags[code as keyof typeof Flags] : null;

                                    return FlagComponent ? (
                                        <div className="w-4 h-3 shadow-sm rounded-[1px] overflow-hidden inline-flex shrink-0">
                                            <FlagComponent title={client.defaultAddress.country} />
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                                <ShoppingBag size={12} className="text-indigo-500" />
                                <span className="text-xs font-bold text-gray-900">{client.numberOfOrders} commandes</span>
                            </div>
                            <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                {client.amountSpent.amount} {client.amountSpent.currencyCode}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
