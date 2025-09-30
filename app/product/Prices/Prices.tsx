import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import { useEffect } from "react";
import useShopifyStore from "../../../components/shopify/shopifyStore";
import CompareAtPriceUpdate from "./CompareAtPriceUpdate";
import PriceUpdate from "./PriceUpdate";
import ResumePrice from "./ResumePrice";
import usePriceStore from "./storePrice";
import { postServer } from "@/library/utils/fetchServer";
import { toast } from "sonner";

export default function Prices() {
    const { product, shopifyBoutique, cssCard } = useShopifyStore();
    const { setPrice, setCompareAtPrice, setIsUpdatingPrice, price, compareAtPrice } = usePriceStore();

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
        <Card className={cssCard}>
            <CardContent className="flex flex-col gap-2">
                {/* Prix principal */}
                <PriceUpdate />

                <Separator className="bg-slate-200" />

                {/* Prix barré */}
                <CompareAtPriceUpdate />

                {/* Résumé visuel */}
                <ResumePrice />
            </CardContent>
        </Card>
    );
}
