import { CountryCode, MarketplaceData } from '@/library/utils/amazon';

export type BeybladeProductType =
    | 'Starter'
    | 'Booster'
    | 'Triple Booster'
    | 'Customize Set'
    | 'Deck Set'
    | 'Random Booster'
    | 'Launcher'
    | 'Battle Set'
    | 'Entry Set'
    | 'Stadium'
    | 'Accessory'
    | null;

export type BeybladeBrand = 'Hasbro' | 'Takara Tomy';

export type BeybladeReleaseType = 'regular' | 'Corocoro' | 'Lottery' | 'Tournament';

export type BeybladeSeries = 'Basic Line' | 'Unique Line' | 'Custom Line' | 'X Over Project';

export interface BeybladeProduct {
    id?: string;
    product?: BeybladeProductType; // Select
    title: string; // Text
    productCode: string; // Text
    brand: BeybladeBrand; // Select
    images?: { alt: string; url: string }[]; // Json (Array of {alt, url})
    releaseDate?: string; // Date
    releaseType: BeybladeReleaseType; // Select
    series: BeybladeSeries; // Select
    slug: string; // Text
    marketplaces?: Partial<Record<CountryCode, MarketplaceData>>; // Json

    // PocketBase System fields
    collectionId?: string;
    collectionName?: string;
    created?: string;
    updated?: string;
}
