import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authOptions } from "../auth/authOption";
import { userEmail } from "../utils/uri";

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerSession(authOptions);
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";
    // Redirection côté serveur si pas de session et pas sur la page boarding
    if (!session && pathname !== "/boarding") redirect("/boarding");

    if (!session) {
        if (pathname !== "/boarding") return null;
        return <>{children}</>;
    }

    if (session && pathname === "/boarding") redirect("/");

    if (session.user?.email !== userEmail) return null;
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
