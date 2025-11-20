import BodyDialogue from "@/components/layout/dialogues/BodyDialogue";
import MySpinner from "@/components/layout/my-spinner";
import BackendProvider from "@/components/layout/providers/BackendProvider";
import Providers from "@/components/layout/providers/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
export const dynamic = "force-dynamic";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Digiblock Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <MySpinner />
                    <BodyDialogue />
                    <Toaster position="top-center" richColors />
                    <BackendProvider>{children}</BackendProvider>
                </Providers>
            </body>
        </html>
    );
}
