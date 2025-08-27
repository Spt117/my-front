"use client";
import { SessionProvider } from "next-auth/react";
import RouterProvider from "./RouterProvider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <SessionProvider>
                <RouterProvider>{children}</RouterProvider>
            </SessionProvider>
        </>
    );
}
