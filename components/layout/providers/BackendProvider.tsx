import { SiteHeader } from '@/components/header/site-header';
import { AppSidebar } from '@/components/menu/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/library/auth/auth';
import { userEmail } from '@/library/utils/uri';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/unknown';

    // Ne JAMAIS rediriger les routes API d'auth
    if (pathname.startsWith('/api/auth')) return <>{children}</>;

    // Si on n'a pas de session
    if (!session) {
        // Si on sait qu'on n'est PAS sur boarding, on redirige
        // Si pathname est '/unknown', on ne redirige pas pour éviter la boucle infinie
        if (pathname !== '/boarding' && pathname !== '/unknown') {
            redirect('/boarding');
        }
        return <>{children}</>;
    }

    // Si on a une session et qu'on est sur boarding, on va à l'accueil
    if (session && pathname === '/boarding') {
        redirect('/');
    }

    if (session.user?.email !== userEmail) return null;

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
