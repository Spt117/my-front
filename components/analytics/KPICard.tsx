'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    subtitle?: string;
}

export function KPICard({ title, value, icon: Icon, gradient, subtitle }: KPICardProps) {
    return (
        <Card className={`relative overflow-hidden border-0 shadow-xl ${gradient}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
            </CardContent>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        </Card>
    );
}
