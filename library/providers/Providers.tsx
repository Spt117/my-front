"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    const path = usePathname();
    const router = useRouter();

    useEffect(() => {
        router.refresh();
    }, [path]);

    return <SessionProvider>{children}</SessionProvider>;
}
