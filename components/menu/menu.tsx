"use client";
import { cn } from "@/library/utils/utils";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export interface MenuProps {
    path: string;
    label: string;
    disabled?: boolean;
}

export default function Menu({ path, label, disabled }: MenuProps) {
    const currentPath = usePathname();

    const isShopifyMenu = path.startsWith("/shopify/");
    const isOnShopify = currentPath.startsWith("/shopify/");

    // La tolérance par suffixe (orders/products/collections/boutique) ne doit s'appliquer
    // qu'aux items du menu Shopify ET quand l'URL courante est elle aussi dans /shopify/*,
    // sinon des routes comme /beycommunity/tables/x_products surlignent à tort "Produits".
    const matchesShopifySuffix =
        isShopifyMenu &&
        isOnShopify &&
        ((path.includes("orders") && currentPath.includes("orders")) ||
            (path.includes("products") && currentPath.includes("products")) ||
            (path.includes("collections") && currentPath.includes("collections")) ||
            (path.includes("boutique") && currentPath.includes("boutique")));

    const isActive =
        currentPath === path ||
        // Pour les items non-Shopify, on surligne aussi sur les sous-routes (ex: /beycommunity/...).
        (!isShopifyMenu && currentPath.startsWith(path + "/")) ||
        matchesShopifySuffix;

    const baseClasses = "min-w-8 duration-200 ease-linear flex items-center gap-2";
    const activeClasses = "bg-primary text-primary-foreground opacity-97 hover:bg-primary hover:text-primary-foreground active:bg-primary/97 ";
    const inactiveClasses = "bg-accent/100 hover:bg-primary/80 hover:text-primary-foreground active:bg-accent/90 active:text-accent-foreground";

    return (
        <Link href={path} className={cn(disabled && "pointer-events-none opacity-50")}>
            <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}>
                    <IconCirclePlusFilled className={cn(isActive && "text-primary-foreground")} />
                    {label}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </Link>
    );
}
