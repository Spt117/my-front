"use client";

import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import useShopifyStore from "../../shopify/shopifyStore";
import AddCollection from "./AddCollection";
import AddProduct from "./AddProduct";
import ChoiceDuplicate from "./ChoiceDuplicate";
import DeleteCollection from "./DeleteCollection";
import DeleteProduct from "./DeleteProduct";
import DuplicateOtherShop from "./DuplicateOtherShop";
import DuplicateProduct from "./DuplicateProduct";

export default function BodyDialogue() {
    const { dialogOpen, closeDialog } = useShopifyStore();

    useKeyboardShortcuts("Escape", () => {
        closeDialog();
    });
    if (!dialogOpen) return null;

    return (
        <div className="fixed inset-0 z-50  flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={closeDialog} />
            {/* Dialogue content */}
            <div className="z-200 min-w-[600px] min-h-[200px] relative z-10 rounded-xl border bg-white p-4 shadow-xl flex flex-col gap-3 justify-evenly">
                {dialogOpen === 1 && <AddProduct />}
                {dialogOpen === 2 && <DeleteProduct />}
                {dialogOpen === 34 && <ChoiceDuplicate />}
                {dialogOpen === 3 && <DuplicateProduct />}
                {dialogOpen === 4 && <DuplicateOtherShop />}
                {dialogOpen === 5 && <AddCollection />}
                {dialogOpen === 6 && <DeleteCollection />}
            </div>
        </div>
    );
}
