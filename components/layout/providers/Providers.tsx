"use client";
import { SessionProvider } from "next-auth/react";
import SearchProvider from "./SearchProvider";
import ShortCutProvider from "./ShortCutProvider";
import SocketProvider from "./SocketProvider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SessionProvider>
            <SocketProvider>
                <ShortCutProvider>
                    <SearchProvider>{children}</SearchProvider>
                </ShortCutProvider>
            </SocketProvider>
        </SessionProvider>
    );
}
