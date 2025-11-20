import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import Tasks from "../../Tasks/Tasks";
import { cssCard } from "../../util";
import ButtonPrices from "./ButtonPrices";
import CompareAtPriceUpdate from "./CompareAtPriceUpdate";
import PriceUpdate from "./PriceUpdate";
import ResumePrice from "./ResumePrice";

export default function Prices() {
    const { product, shopifyBoutique } = useShopifyStore();
    if (!product || !shopifyBoutique) return null;

    return (
        <Card className={cssCard}>
            <CardContent className="flex flex-col gap-2">
                {/* Prix principal */}
                <ButtonPrices />

                <PriceUpdate />

                <Separator className="bg-slate-200" />

                {/* Prix barré */}
                <CompareAtPriceUpdate />

                {/* Résumé visuel */}
                <ResumePrice />

                <Separator className="bg-slate-200" />
                <Tasks />
            </CardContent>
        </Card>
    );
}
