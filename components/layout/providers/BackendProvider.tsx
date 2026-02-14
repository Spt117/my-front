import { SiteHeader } from '@/components/header/site-header';
import { AppSidebar } from '@/components/menu/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { headers } from 'next/headers';

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/unknown';

    // Pages sans layout (boarding, auth) : rendu brut sans sidebar
    if (pathname === '/boarding' || pathname.startsWith('/api/auth')) {
        return <>{children}</>;
    }

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)',
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
