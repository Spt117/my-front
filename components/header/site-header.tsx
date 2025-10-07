"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Orders from "./Orders";
import SearchProduct from "./products/SearchProduct";
import ShopifySelect from "./ShopifySelect";
import SelectStock from "./stock/SelectStock";
import SearchStockProduct from "./stock/SearchStockProduct";
import SelectAffiliationSite from "./SelectAffiliationSite";

export function SiteHeader() {
    const pathname = usePathname();
    const searchProductsPaths = ["/product-duplicate", "/product"];
    const excludeShopifySelectPaths = ["/stock", "/tasks", "/create"];

    return (
        <header className="sticky top-0 z-50 bg-white flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 ">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                {!excludeShopifySelectPaths.includes(pathname) && <ShopifySelect />}
                {pathname === "/stock" && (
                    <>
                        <SelectStock />
                        <SearchStockProduct />
                    </>
                )}
                {searchProductsPaths.includes(pathname) && <SearchProduct />}
                {pathname === "/" && <Orders />}
                {pathname === "/create" && <SelectAffiliationSite />}
            </div>
        </header>
    );
}
