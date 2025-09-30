import useShopifyStore from "@/components/shopify/shopifyStore";
import usePriceStore from "./storePrice";
import { Badge } from "@/components/ui/badge";

export default function ResumePrice() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { price, compareAtPrice } = usePriceStore();
    if (!product || !shopifyBoutique) return null;

    if (compareAtPrice && price && Number(compareAtPrice) > Number(price))
        return (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Économie client</span>
                    <div className="flex items-center gap-2">
                        <span className="line-through text-slate-400">
                            {compareAtPrice}
                            {shopifyBoutique.devise}
                        </span>
                        <span className="font-semibold text-emerald-700">
                            {price}
                            {shopifyBoutique.devise}
                        </span>
                        <Badge variant="destructive" className="bg-red-100 text-red-700">
                            -{(parseFloat(compareAtPrice) - parseFloat(price)).toFixed(2)}
                            {shopifyBoutique.devise}
                        </Badge>
                    </div>
                </div>
            </div>
        );
}
