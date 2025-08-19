import { getServerSession } from "next-auth";
import { userEmail } from "../utils/uri";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "../auth/authOption";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { headers } from "next/headers";

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerSession(authOptions);
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";

    if (!session) {
        if (pathname !== "/boarding") return null;
        return <>{children}</>;
    }

    if (session.user?.email === userEmail)
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

    return null;
}
