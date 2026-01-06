'use client';
import HeaderPokemon from '@/app/pokemon/Header';
import BulkHeader from '@/app/shopify/[shopId]/bulk/BulkHeader';
import HeaderCollection from '@/app/shopify/[shopId]/collections/HeaderCollections';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import SelectAffiliationSite from '../../app/create/HeaderTaskAffiliations';
import ShopifySelect from './ShopifySelect';
import HeaderStock from './stock/HeaderStock';
import UnifiedSearchShopify from './UnifiedSearchShopify';

export function SiteHeader() {
    const pathname = usePathname();
    return (
        <header className="sticky p-1 top-0 z-49 bg-white flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 ">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                {(pathname.includes('shopify') || pathname === '/') && <ShopifySelect />}
                {pathname === '/create' && <SelectAffiliationSite />}
                {pathname === '/stock' && <HeaderStock />}
                {pathname === '/pokemon' && <HeaderPokemon />}
                {pathname.includes('bulk') && <BulkHeader />}
                {pathname.includes('products') && <UnifiedSearchShopify type="products" />}
                {pathname.includes('clients') && <UnifiedSearchShopify type="clients" />}
                {pathname.includes('collections') && <HeaderCollection />}
                {pathname.includes('orders') && <UnifiedSearchShopify type="orders" />}
            </div>
        </header>
    );
}
