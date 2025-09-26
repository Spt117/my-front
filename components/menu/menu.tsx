"use client";
import { cn } from "@/library/utils/utils";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export interface MenuProps {
    path: string;
    label: string;
}

export default function Menu({ path, label }: MenuProps) {
    const currentPath = usePathname();
    const isActive = currentPath === path;

    const baseClasses = "min-w-8 duration-200 ease-linear flex items-center gap-2";
    const activeClasses =
        "bg-primary text-primary-foreground opacity-97 hover:bg-primary hover:text-primary-foreground active:bg-primary/97 ";
    const inactiveClasses =
        "bg-accent/100 hover:bg-primary/80 hover:text-primary-foreground active:bg-accent/90 active:text-accent-foreground";

    return (
        <a href={path}>
            <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}>
                    <IconCirclePlusFilled className={cn(isActive && "text-primary-foreground")} />
                    {label}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </a>
    );
}
