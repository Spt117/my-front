import { getBoutiques } from "@/library/pocketbase/ShopifyBoutiqueService";
import ShopifyLayoutClient from "./LayoutClient";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const boutiques = await getBoutiques();
    return <ShopifyLayoutClient allBoutiques={boutiques}>{children}</ShopifyLayoutClient>;
}
