"use client";
import { SessionProvider } from "next-auth/react";
import SocketProvider from "./SocketProvider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SessionProvider>
            <SocketProvider>{children}</SocketProvider>
        </SessionProvider>
    );
}
