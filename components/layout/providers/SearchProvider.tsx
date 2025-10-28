"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sync `searchTerm` <-> URL instantly (no navigation) + debounced router.replace for SSR/searchParams consumers.
 * - Instant URL update via history.replaceState (no re-render)
 * - Debounced router.replace to refresh server components that read searchParams
 * - Loop guard to avoid URL->state->URL feedback
 */
export default function SearchProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { searchTerm, setSearchTerm } = useShopifyStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const internalUpdateRef = useRef(false);

    // 1) URL -> state (runs on initial load and each navigation)
    useEffect(() => {
        const urlSearchTerm = searchParams.get("search") ?? "";

        // Ignore the immediate URL change we just did ourselves (see effect 2)
        if (internalUpdateRef.current) {
            internalUpdateRef.current = false;
            return;
        }

        if (urlSearchTerm !== (searchTerm ?? "")) {
            setSearchTerm(urlSearchTerm);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // depend on object identity change from App Router

    // 2) state -> URL (instant + debounced navigation to keep SSR/searchParams in sync)
    useEffect(() => {
        // Build params from the *current* URL to avoid staleness
        const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        const current = params.get("search") ?? "";

        // No-op if nothing changed
        if ((searchTerm ?? "") === current) return;

        if (searchTerm && searchTerm.length > 0) {
            params.set("search", searchTerm);
        } else {
            params.delete("search");
        }

        const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;

        // A) Instant URL update without navigation (zero-lag UI)
        if (typeof window !== "undefined") {
            internalUpdateRef.current = true; // tell the URL->state effect to skip this round
            window.history.replaceState(null, "", href);
        }

        // B) Debounced navigation to refresh any Server Components reading searchParams
        const id = setTimeout(() => {
            // Use replace to avoid history stack spam and prevent scroll jumps
            router.replace(href, { scroll: false });
        }, 250); // tweak delay as needed (150–300ms works well)

        return () => clearTimeout(id);
        // Only react to searchTerm/pathname changes; do not include searchParams to avoid loops
    }, [searchTerm, pathname, router]);

    return <>{children}</>;
}
