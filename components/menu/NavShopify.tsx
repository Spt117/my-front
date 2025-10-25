"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { menuShopify } from "@/params/menu";
import { Eye } from "lucide-react";
import useShopifyStore from "../shopify/shopifyStore";
import Menu from "./menu";

export function NavShopify() {
    const { shopifyBoutique } = useShopifyStore();
    const productUrl = `https://${shopifyBoutique?.publicDomain}`;

    const menuShopifyItems = menuShopify(shopifyBoutique?.id);

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-3">
                    <div className="flex items-center justify-between ">
                        <SidebarGroupLabel className="px-3 text-sm font-medium text-muted-foreground">Shopify</SidebarGroupLabel>
                        {shopifyBoutique && (
                            <a
                                href={productUrl}
                                className="p-1 hover:bg-gray-200 rounded-md right-3 top-2"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Afficher votre boutique"
                            >
                                <Eye size={20} className="text-slate-400 hover:text-slate-600 transition-colors" />
                            </a>
                        )}
                    </div>
                    {menuShopifyItems.map((item) => (
                        <Menu key={item.path} path={item.path} label={item.label} disabled={item.disabled} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
