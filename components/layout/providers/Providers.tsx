"use client";
import { SessionProvider } from "next-auth/react";
import SearchProvider from "./SearchProvider";
import ShortCutProvider from "./ShortCutProvider";
import SocketProvider from "./SocketProvider";
import ShopifyInitProvider from "./ShopifyInitProvider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SessionProvider>
            <SocketProvider>
                <ShortCutProvider>
                    <ShopifyInitProvider>
                        <SearchProvider>{children}</SearchProvider>
                    </ShopifyInitProvider>
                </ShortCutProvider>
            </SocketProvider>
        </SessionProvider>
    );
}
