"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { shopifyBoutique } = useShopifyStore();

    useEventListener("products/update", () => {
        if (shopifyBoutique?.domain) router.refresh();
    });

    useEventListener("products/create", (data) => {
        if (data.domain === shopifyBoutique?.domain) router.refresh();
    });

    return <>{children}</>;
}
