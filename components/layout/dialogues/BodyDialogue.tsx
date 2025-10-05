"use client";

import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import useShopifyStore from "../../shopify/shopifyStore";
import AddProduct from "./AddProduct";
import DeleteProduct from "./DeleteProduct";

export default function BodyDialogue() {
    const { dialogOpen, closeDialog } = useShopifyStore();

    useKeyboardShortcuts("Escape", () => {
        closeDialog();
    });
    if (!dialogOpen) return null;

    return (
        <div className="fixed inset-0 z-500 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={closeDialog} />
            {/* Dialogue content */}
            {dialogOpen === 1 && <AddProduct />}
            {dialogOpen === 2 && <DeleteProduct />}
        </div>
    );
}
