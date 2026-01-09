'use client';

import { Calendar } from 'lucide-react';
import { formatDate, PeriodType } from './AnalyticsUtils';

interface PeriodSelectorProps {
    period: PeriodType;
    setPeriod: (p: PeriodType) => void;
    customStart: Date;
    setCustomStart: (d: Date) => void;
    customEnd: Date;
    setCustomEnd: (d: Date) => void;
}

export function AnalyticsPeriodSelector({
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
}: PeriodSelectorProps) {
    const periods: { value: PeriodType; label: string }[] = [
        { value: 'today', label: "Aujourd'hui" },
        { value: 'yesterday', label: 'Hier' },
        { value: 'week', label: '7 jours' },
        { value: 'month', label: '30 jours' },
        { value: 'currentMonth', label: 'Mois en cours' },
        { value: 'currentYear', label: 'Année en cours' },
        { value: 'year', label: '1 an' },
        { value: 'custom', label: 'Personnalisé' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <Calendar className="w-5 h-5 text-slate-600" />
            <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                            period === p.value
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-white/70 text-slate-600 hover:bg-white hover:shadow-md'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
            {period === 'custom' && (
                <div className="flex items-center gap-2 ml-auto">
                    <input
                        type="date"
                        value={formatDate(customStart)}
                        onChange={(e) => {
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            if (y && m && d) setCustomStart(new Date(y, m - 1, d, 0, 0, 0));
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <span className="text-slate-400">→</span>
                    <input
                        type="date"
                        value={formatDate(customEnd)}
                        onChange={(e) => {
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            if (y && m && d) setCustomEnd(new Date(y, m - 1, d, 23, 59, 59));
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
            )}
        </div>
    );
}
