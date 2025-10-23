import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";

export default function HeaderCollection() {
    const { searchTerm, setSearchTerm } = useShopifyStore();

    return <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher une collection..." className="flex-1" />;
}
