"use client";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/library/utils/utils";

export interface MenuProps {
    path: string;
    label: string;
}

export default function Menu({ path, label }: MenuProps) {
    const currentPath = usePathname();
    const isActive = currentPath === path;

    const router = useRouter();
    const handleClick = () => {
        router.push(path);
    };

    const baseClasses = "min-w-8 duration-200 ease-linear flex items-center gap-2";
    const activeClasses = "bg-primary text-primary-foreground opacity-97 hover:bg-primary hover:text-primary-foreground active:bg-primary/97 ";
    const inactiveClasses = "bg-accent/100 hover:bg-primary/80 hover:text-primary-foreground active:bg-accent/90 active:text-accent-foreground";

    return (
        <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton onClick={handleClick} className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}>
                <IconCirclePlusFilled className={cn(isActive && "text-primary-foreground")} />
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
