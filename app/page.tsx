import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { marketPlaceEnum } from "@/library/models/asins/asin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assurez-vous que le chemin pointe vers les composants select de Shadcn

export default function Page() {
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
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input placeholder="ASIN" className="w-full md:w-[300px] rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
                            <Select>
                                <SelectTrigger className="w-full md:w-[200px] rounded-lg border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                                    <SelectValue placeholder="Choisir un marché" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-gray-200 bg-white shadow-lg">
                                    {marketPlaceEnum.map((option) => (
                                        <SelectItem key={option} value={option} className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 transition-colors">
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
