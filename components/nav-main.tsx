import { SidebarGroup, SidebarGroupContent, SidebarMenu } from "@/components/ui/sidebar";
import Menu, { MenuProps } from "./menu";

export function NavMain() {
    const menuItems: MenuProps[] = [
        { path: "/", label: "Produit" },
        { path: "/product-create", label: "Créer une fiches produit" },
        { path: "/product-duplicate", label: "Dupliquer une fiche produit" },
        { path: "/asins", label: "Asins à surveiller" },
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
