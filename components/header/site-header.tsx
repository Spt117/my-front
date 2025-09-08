import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import Orders from "./Orders";
import SearchProduct from "./SearchProduct";
import ShopifySelect from "./ShopifySelect";

export async function SiteHeader() {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";

    const searchProductsPaths = ["/", "/product-duplicate"];

    return (
        <header className="sticky top-0 z-50 bg-white flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 ">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                <ShopifySelect />
                {searchProductsPaths.includes(pathname) && <SearchProduct />}
                {pathname === "/orders" && <Orders />}
            </div>
        </header>
    );
}
