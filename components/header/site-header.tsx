"use client";
import HeaderPokemon from "@/app/pokemon/Header";
import HeaderCollection from "@/app/shopify/[shopId]/collections/HeaderCollections";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import BulkHeader from "../../app/bulk/BulkHeader";
import Orders from "./Orders";
import ShopifySelect from "./ShopifySelect";
import SearchProduct from "./products/SearchProduct";
import HeaderStock from "./stock/HeaderStock";
import SelectAffiliationSite from "./taskAffiliation/SelectAffiliationSite";

export function SiteHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky p-1 top-0 z-49 bg-white flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 ">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                {pathname === "/" && <Orders />}
                {pathname === "/create" && <SelectAffiliationSite />}
                {pathname === "/stock" && <HeaderStock />}
                {pathname === "/bulk" && <BulkHeader />}
                {pathname === "/pokemon" && <HeaderPokemon />}
                {pathname.includes("shopify") && <ShopifySelect />}
                {pathname.includes("products") && <SearchProduct />}
                {pathname.includes("/collections") && <HeaderCollection />}
            </div>
        </header>
    );
}
