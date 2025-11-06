"use client";

import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEventListener("orders/paid", (data: any) => {
        router.refresh();
    });

    return <>{children}</>;
}
