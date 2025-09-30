import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { postServer } from "@/library/utils/fetchServer";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import usePriceStore from "./storePrice";

export default function ButtonPrices() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { setPrice, setCompareAtPrice, setIsUpdatingPrice, price, compareAtPrice, isUpdatingPrice, isChanged } =
        usePriceStore();

    if (!product || !shopifyBoutique) return null;

    useEffect(() => {
        setPrice(product.variants.nodes[0].price);
        setCompareAtPrice(product.variants.nodes[0].compareAtPrice || "0");
    }, [product.variants.nodes[0].price, product.variants.nodes[0].compareAtPrice]);

    const mainVariant = product.variants.nodes[0];

    const handleUpdatePrice = async () => {
        setIsUpdatingPrice(true);
        if (Number(price) !== Number(mainVariant.price)) {
            const url = "http://localhost:9100/shopify/update-price";
            const data = {
                domain: shopifyBoutique.domain,
                productId: product.id,
                variantId: mainVariant.id,
                price: Number(price),
            };
            try {
                const res = await postServer(url, data);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (error) {
                toast.error("Erreur lors de la mise à jour du prix");
            } finally {
                setPrice(mainVariant.price);
            }
        }
        if (Number(compareAtPrice) !== Number(mainVariant.compareAtPrice || "0")) {
            const url = "http://localhost:9100/shopify/update-compare-at-price";
            const data = {
                domain: shopifyBoutique.domain,
                productId: product.id,
                variantId: mainVariant.id,
                compareAtPrice: Number(compareAtPrice),
            };
            try {
                const res = await postServer(url, data);
                if (res.error) toast.error(res.error);
                if (res.message) toast.success(res.message);
            } catch (error) {
                toast.error("Erreur lors de la mise à jour du prix barré");
            } finally {
                setCompareAtPrice(mainVariant.compareAtPrice || "0");
            }
        }
        setIsUpdatingPrice(false);
    };

    return (
        <Button
            disabled={!isChanged}
            onClick={handleUpdatePrice}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 min-w-[150px]"
        >
            {isUpdatingPrice ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Mise à jour...</span>
                </div>
            ) : isChanged ? (
                <div className="flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Mettre à jour</span>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <X className="h-4 w-4" />
                    <span className="text-xs">À jour</span>
                </div>
            )}
        </Button>
    );
}
