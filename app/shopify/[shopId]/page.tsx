'use client';

import { AnalyticsPeriodSelector } from "@/components/analytics/AnalyticsPeriodSelector";
import { PeriodType } from "@/components/analytics/AnalyticsUtils";
import { ShopAnalyticsView } from "@/components/analytics/ShopAnalyticsView";
import { boutiqueFromId } from "@/params/paramsShopify";
import { use, useState } from "react";

export default function Page({ params }: { params: Promise<{ shopId: string }> }) {
    const { shopId } = use(params);
    const boutique = boutiqueFromId(shopId);

    const [period, setPeriod] = useState<PeriodType>('today');
    const [customStart, setCustomStart] = useState<Date>(new Date());
    const [customEnd, setCustomEnd] = useState<Date>(new Date());

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        Tableau de Bord
                    </h1>
                    <p className="text-slate-500">Analytics pour {boutique.publicDomain}</p>
                </div>
            </div>

            <AnalyticsPeriodSelector
                period={period}
                setPeriod={setPeriod}
                customStart={customStart}
                setCustomStart={setCustomStart}
                customEnd={customEnd}
                setCustomEnd={setCustomEnd}
            />

            <ShopAnalyticsView
                boutique={boutique}
                period={period}
                customStart={customStart}
                customEnd={customEnd}
            />
        </div>
    );
}
