"use client";

import useShopifyStore from "../shopify/shopifyStore";

export default function MySpinner({ active }: { active?: boolean }) {
    const { mySpinner } = useShopifyStore();

    if (!mySpinner && !active) return null;

    return (
        <div className="w-full h-full inset-0 z-5 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );
}
