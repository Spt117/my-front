// 1. Définition des clés autorisées (Codes pays)
export type CountryCode =
    // Amériques
    | 'US'
    | 'CA'
    | 'MX'
    | 'BR'
    // Amériques
    // Europe
    | 'UK'
    | 'DE'
    | 'FR'
    | 'IT'
    | 'ES'
    | 'NL'
    | 'TR'
    | 'BE'
    | 'PL'
    // Sweden
    | 'SE'
    | 'IR'
    // Europe
    // Asie / Pacifique
    | 'JP'
    | 'IN'
    | 'AU'
    | 'SG'
    // Asie / Pacifique
    // Moyen-Orient
    | 'AE'
    | 'SA';
// Moyen-Orient

// 2. Interface pour les détails du marché
export interface MarketplaceInfo {
    url: string;
    currency: string;
}

// 3. L'objet de configuration constant
export const AMAZON_MARKETPLACES: Record<CountryCode, MarketplaceInfo> = {
    US: { url: 'https://www.amazon.com', currency: 'USD' },
    CA: { url: 'https://www.amazon.ca', currency: 'CAD' },
    MX: { url: 'https://www.amazon.com.mx', currency: 'MXN' },
    BR: { url: 'https://www.amazon.com.br', currency: 'BRL' },

    UK: { url: 'https://www.amazon.co.uk', currency: 'GBP' },
    DE: { url: 'https://www.amazon.de', currency: 'EUR' },
    FR: { url: 'https://www.amazon.fr', currency: 'EUR' },
    IT: { url: 'https://www.amazon.it', currency: 'EUR' },
    ES: { url: 'https://www.amazon.es', currency: 'EUR' },
    NL: { url: 'https://www.amazon.nl', currency: 'EUR' },
    BE: { url: 'https://www.amazon.com.be', currency: 'EUR' },
    PL: { url: 'https://www.amazon.pl', currency: 'PLN' },
    SE: { url: 'https://www.amazon.se', currency: 'SEK' },
    IR: { url: 'https://www.amazon.ie', currency: 'IRR' },
    TR: { url: 'https://www.amazon.com.tr', currency: 'TRY' },

    JP: { url: 'https://www.amazon.co.jp', currency: 'JPY' },
    IN: { url: 'https://www.amazon.in', currency: 'INR' },
    AU: { url: 'https://www.amazon.com.au', currency: 'AUD' },
    SG: { url: 'https://www.amazon.sg', currency: 'SGD' },

    AE: { url: 'https://www.amazon.ae', currency: 'AED' },
    SA: { url: 'https://www.amazon.sa', currency: 'SAR' },
};

export const COUNTRY_REGIONS: Record<string, CountryCode[]> = {
    Americas: ['US', 'CA', 'MX', 'BR'],
    Europe: ['UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'TR', 'BE', 'PL', 'SE', 'IR'],
    'Asia Pacific': ['JP', 'IN', 'AU', 'SG'],
    'Middle East': ['AE', 'SA'],
};

// 2. Structure des données pour un marché spécifique
export interface MarketplaceData {
    asin: string;
    price: number;
    currency: string; // Toujours utile de préciser la devise (USD, EUR, etc.)
}

// 3. L'interface principale du Produit
interface GlobalProduct {
    id: string; // Ton ID de référence interne
    marketplaces: Partial<Record<CountryCode, MarketplaceData>>;
}
