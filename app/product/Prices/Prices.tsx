import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import { cssCard } from "../util";
import CompareAtPriceUpdate from "./CompareAtPriceUpdate";
import PriceUpdate from "./PriceUpdate";
import ResumePrice from "./ResumePrice";
import DatePicker from "../Tasks/DatePicker";

export default function Prices() {
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

                <Separator className="bg-slate-200" />
                <DatePicker />
            </CardContent>
        </Card>
    );
}
