'use client';

import useAffiliationStore from '@/app/create/storeTasksAffiliation';
import Selecteur from '@/components/selecteur';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Input } from '@/components/ui/input';
import useKeyboardShortcuts from '@/library/hooks/useKyboardShortcuts';
import { boutiqueFromPublicDomain, boutiques, TPublicDomainsShopify } from '@/params/paramsShopify';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function SelectAffiliationSite() {
    const { websiteFilter, setWebsiteFilter, setTypesProducts, typesProducts, arrayTypesProducts, arraySites } = useAffiliationStore();
    const { shopifyBoutique, setShopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();

    const optionWebsite = boutiques.map((website) => ({
        label: website.publicDomain,
        value: website.publicDomain,
    }));

    const optionTypesProducts = arrayTypesProducts.map((type) => ({
        label: type,
        value: type,
    }));

    const handleEscape = () => {
        setWebsiteFilter('');
        setTypesProducts('');
        setShopifyBoutique(null);
        setSearchTerm('');
    };
    useKeyboardShortcuts('Escape', handleEscape);

    useEffect(() => {
        if (shopifyBoutique) setWebsiteFilter(shopifyBoutique.publicDomain);
    }, [shopifyBoutique]);

    const handleChangeWebsite = (value: string) => {
        const boutique = boutiqueFromPublicDomain(value as TPublicDomainsShopify);
        setShopifyBoutique(boutique);
    };

    const hasActiveFilters = websiteFilter || typesProducts || searchTerm;

    return (
        <>
            <Selecteur className="w-[180px] shrink-0" array={optionWebsite} value={websiteFilter} onChange={handleChangeWebsite} placeholder="Site d'origine" />
            <Selecteur className="w-[180px] shrink-0" array={optionTypesProducts} value={typesProducts} onChange={setTypesProducts} placeholder="Type de produit" />
            <Input
                className="flex-1 min-w-[150px]"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {hasActiveFilters && (
                <button
                    onClick={handleEscape}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    title="Réinitialiser les filtres"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </>
    );
}
