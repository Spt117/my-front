import { IconCactus, IconCirclePlusFilled, IconLocationExclamation } from "@tabler/icons-react";

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Menu, { MenuProps } from "./menu";

export function NavMain() {
    const handleQuickCreate = () => {};

    const menuItems: MenuProps[] = [
        { path: "/", label: "Asins à surveiller" },
        { path: "/product-create", label: "Créer une fiches produit" },
        { path: "/product-duplicate", label: "Dupliquer une fiche produit" },
    ];

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-4">
                    {menuItems.map((item) => (
                        <Menu key={item.path} path={item.path} label={item.label} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
