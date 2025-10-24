import { SidebarGroup, SidebarGroupContent, SidebarMenu } from "@/components/ui/sidebar";
import { menuItems } from "@/params/menu";
import Menu from "./menu";

export function NavMain() {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-3">
                    {menuItems.map((item) => (
                        <Menu key={item.path} path={item.path} label={item.label} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
