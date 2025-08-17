import { getServerSession } from "next-auth";
import { getUserFromHeader } from "../auth/secureServer";
import { userEmail } from "../utils/uri";
import StoreProvider from "./StoreProvider";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "../auth/authOption";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { headers } from "next/headers";

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = await getUserFromHeader();
    const session = await getServerSession(authOptions);
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";
    console.log(pathname);

    if (!session) {
        if (pathname !== "/boarding") return null;
        return <>{children}</>;
    }

    if (session.user?.email === userEmail)
        return (
            <StoreProvider user={user}>
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
            </StoreProvider>
        );

    return null;
}
