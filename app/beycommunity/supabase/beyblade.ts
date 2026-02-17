import { CountryCode, MarketplaceData } from '@/library/utils/amazon';

export type BeybladeProductType =
    | 'Starter'
    | 'Booster'
    | 'Triple Booster'
    | 'Customize Set'
    | 'Deck Set'
    | 'Random Booster'
    | 'Launcher'
    | 'Grip'
    | 'Battle Set'
    | 'Entry Set'
    | 'Stadium'
    | 'Accessory'
    | null;

export type BeybladeBrand = 'Hasbro' | 'Takara Tomy';

export type BeybladeReleaseType = 'Regular' | 'Corocoro' | 'Lottery' | 'Tournament' | 'Limited' | 'Collaboration';

export type BeybladeSeries = 'Basic Line' | 'Unique Line' | 'Custom Line' | 'X Over Project';

export interface BeybladeProduct {
    id?: string;
    product?: BeybladeProductType;
    title: string;
    sku: string;
    brand: BeybladeBrand;
    images?: { alt: string; url: string }[];
    releaseDate?: string;
    releaseType: BeybladeReleaseType;
    series: BeybladeSeries;
    slug: string;
    notes?: string;
    // Supabase system fields
    created_at?: string;
    updated_at?: string;
    // Legacy JSON column (not in x_products schema of beycommunity — kept for UI compatibility)
    marketplaces?: Partial<Record<CountryCode, MarketplaceData>>;
}
