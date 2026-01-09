import { boutiques, TDomainsShopify } from '@/params/paramsShopify';

export type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'currentMonth' | 'currentYear' | 'year' | 'custom';

export function getParisTime(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
}

export function getParisMidnight(date: Date): Date {
    const now = new Date();
    const parisLocal = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    parisLocal.setHours(0, 0, 0, 0);
    const diff = now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getTime();
    return new Date(parisLocal.getTime() + diff);
}

export function getDateRange(period: PeriodType, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
    const now = new Date();
    const todayParis = getParisMidnight(now);

    switch (period) {
        case 'today':
            return { start: todayParis, end: now };
        case 'yesterday': {
            const start = new Date(todayParis);
            start.setDate(start.getDate() - 1);
            const end = new Date(todayParis.getTime() - 1);
            return { start, end };
        }
        case 'week': {
            const start = new Date(todayParis);
            start.setDate(start.getDate() - 7);
            return { start, end: now };
        }
        case 'month': {
            const start = new Date(todayParis);
            start.setDate(start.getDate() - 30);
            return { start, end: now };
        }
        case 'currentMonth': {
            const parisNow = getParisTime(now);
            const start = getParisMidnight(new Date(parisNow.getFullYear(), parisNow.getMonth(), 1));
            return { start, end: now };
        }
        case 'currentYear': {
            const parisNow = getParisTime(now);
            const start = getParisMidnight(new Date(parisNow.getFullYear(), 0, 1));
            return { start, end: now };
        }
        case 'year': {
            const start = new Date(todayParis);
            start.setFullYear(start.getFullYear() - 1);
            return { start, end: now };
        }
        case 'custom':
            return {
                start: customStart ? getParisMidnight(customStart) : todayParis,
                end: customEnd ? new Date(getParisMidnight(customEnd).getTime() + 24 * 60 * 60 * 1000 - 1) : now,
            };
        default:
            return { start: todayParis, end: now };
    }
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function extractProductId(productId: string) {
    const parts = productId.split('/');
    return parts[parts.length - 1];
}

export function getShopIdFromDomain(domain: TDomainsShopify) {
    const boutique = boutiques.find((b) => b.domain === domain);
    return boutique?.id;
}
