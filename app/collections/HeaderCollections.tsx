import useShopifyStore from "@/components/shopify/shopifyStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ShopifySelect from "../../components/header/ShopifySelect";
import { Input } from "@/components/ui/input";

export default function HeaderCollection() {
    const { loading, setLoading, setSearchMode, searchMode, shopifyBoutique, searchTerm, setSearchTerm } = useShopifyStore();
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
        <div className="w-full flex gap-2">
            <ShopifySelect />
            <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une collection..."
                className="flex-1"
            />
        </div>
    );
}
