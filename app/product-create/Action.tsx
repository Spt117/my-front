"use client";

import SearchProduct from "@/components/shopify/SearchProduct";
import ShopifySelect from "@/components/ShopifySelect";

export default function Action() {
    return (
        <>
            <ShopifySelect />
            <hr />
            <SearchProduct />
        </>
    );
}
