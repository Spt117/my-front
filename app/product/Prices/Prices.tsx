import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import { cssCard } from "../util";
import ButtonPrices from "./ButtonPrices";
import CompareAtPriceUpdate from "./CompareAtPriceUpdate";
import PriceUpdate from "./PriceUpdate";
import ResumePrice from "./ResumePrice";
import Tasks from "../Tasks/Tasks";
import { TaskShopifyController } from "@/library/models/tasksShopify/taskController";

export default async function Prices({ sku }: { sku: string }) {
    const tasks = await TaskShopifyController.getTaskBySkuAndStockActivation(sku);
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
                <ResumePrice tasksData={tasks} />

                <Separator className="bg-slate-200" />
                <Tasks />
            </CardContent>
        </Card>
    );
}
