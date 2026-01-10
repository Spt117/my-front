"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { menuShopify } from "@/params/menu";
import { Eye, LayoutDashboard } from "lucide-react";
import useShopifyStore from "../shopify/shopifyStore";
import Menu from "./menu";

export function NavShopify() {
    const { shopifyBoutique } = useShopifyStore();
    const productUrl = `https://${shopifyBoutique?.publicDomain}`;
    const adminUrl = `https://${shopifyBoutique?.domain}/admin`;

    const menuShopifyItems = menuShopify(shopifyBoutique?.id);

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-3">
                    <div className="flex items-center justify-between ">
                        <SidebarGroupLabel className="px-3 text-sm font-medium text-muted-foreground">Shopify</SidebarGroupLabel>
                        {shopifyBoutique && (
                            <div className="flex items-center gap-1 pr-2">
                                <a
                                    href={productUrl}
                                    className="p-1 hover:bg-gray-200 rounded-md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Afficher la boutique"
                                >
                                    <Eye size={20} className="text-slate-400 hover:text-slate-600 transition-colors" />
                                </a>
                                <a
                                    href={adminUrl}
                                    className="p-1 hover:bg-gray-200 rounded-md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Afficher l'interface d'administration"
                                >
                                    <LayoutDashboard size={20} className="text-slate-400 hover:text-slate-600 transition-colors" />
                                </a>
                            </div>
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
