"use client";

import * as React from "react";

import { NavMain } from "@/components/menu/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconInnerShadowTop } from "@tabler/icons-react";
import Logout from "./Logout";
import { NavShopify } from "./NavShopify";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <a href="/" className="flex items-center gap-2">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">Digiblock</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
                <NavShopify />
            </SidebarContent>
            <hr />
            <SidebarFooter>
                <Logout />
            </SidebarFooter>
        </Sidebar>
    );
}
