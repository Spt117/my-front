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
    const isActive =
        currentPath === path ||
        (path.includes("orders") && currentPath.includes("orders")) ||
        (path.includes("products") && currentPath.includes("products")) ||
        (path.includes("collections") && currentPath.includes("collections"));

    const baseClasses = "min-w-8 duration-200 ease-linear flex items-center gap-2";
    const activeClasses =
        "bg-primary text-primary-foreground opacity-97 hover:bg-primary hover:text-primary-foreground active:bg-primary/97 ";
    const inactiveClasses =
        "bg-accent/100 hover:bg-primary/80 hover:text-primary-foreground active:bg-accent/90 active:text-accent-foreground";

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
