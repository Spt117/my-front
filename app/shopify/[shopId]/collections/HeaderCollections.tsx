import useShopifyStore from "@/components/shopify/shopifyStore";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HeaderCollection() {
    const { setLoading, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
    const router = useRouter();

    const handleBoutiqueChange = async () => {
        setLoading(true);
        const url = `/collections?domain=${shopifyBoutique?.domain}`;
        router.push(url);
        setLoading(false);
    };

    useEffect(() => {
        if (shopifyBoutique) {
            handleBoutiqueChange();
        }
    }, [shopifyBoutique]);

    return (
        <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une collection..."
            className="flex-1"
        />
    );
}
