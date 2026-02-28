"use client";
import { IShopifyBase } from "@/params/paramsShopifyTypes";
import { SessionProvider } from "next-auth/react";
import SearchProvider from "./SearchProvider";
import ShortCutProvider from "./ShortCutProvider";
import SocketProvider from "./SocketProvider";
import ShopifyInitProvider from "./ShopifyInitProvider";

export default function Providers({ children, boutiques }: Readonly<{ children: React.ReactNode; boutiques: IShopifyBase[] }>) {
    return (
        <SessionProvider>
            <SocketProvider>
                <ShortCutProvider>
                    <ShopifyInitProvider boutiques={boutiques}>
                        <SearchProvider>{children}</SearchProvider>
                    </ShopifyInitProvider>
                </ShortCutProvider>
            </SocketProvider>
        </SessionProvider>
    );
}
