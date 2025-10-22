"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { menuShopify } from "@/params/menu";
import useShopifyStore from "../shopify/shopifyStore";
import Menu from "./menu";

export function NavShopify() {
    const { shopifyBoutique } = useShopifyStore();

    const menuShopifyItems = menuShopify(shopifyBoutique?.id);

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarGroupLabel className="px-3 text-sm font-medium text-muted-foreground">Shopify</SidebarGroupLabel>
                    {menuShopifyItems.map((item) => (
                        <Menu key={item.path} path={item.path} label={item.label} disabled={item.disabled} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
