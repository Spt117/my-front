// 1. Définition des clés autorisées (Codes pays)
export type CountryCode =
    // Amériques
    | "US"
    | "CA"
    | "MX"
    | "BR"
    // Amériques
    // Europe
    | "UK"
    | "DE"
    | "FR"
    | "IT"
    | "ES"
    | "NL"
    // | 'TR'
    | "BE"
    | "PL"
    // Sweden
    | "SE"
    | "IR"
    // Europe
    // Asie / Pacifique
    | "JP"
    | "IN"
    // | 'AU'
    | "SG"
    // Asie / Pacifique
    // Moyen-Orient
    | "AE"
    | "SA";
// Moyen-Orient

// 2. Interface pour les détails du marché
export interface MarketplaceInfo {
    url: string;
    currency: string;
    domainId?: number;
}

// 3. L'objet de configuration constant
export const AMAZON_MARKETPLACES = {
    US: { url: "https://www.amazon.com", currency: "USD", domainId: 1 },
    CA: { url: "https://www.amazon.ca", currency: "CAD", domainId: 6 },
    MX: { url: "https://www.amazon.com.mx", currency: "MXN", domainId: 11 },
    BR: { url: "https://www.amazon.com.br", currency: "BRL" },

    UK: { url: "https://www.amazon.co.uk", currency: "GBP", domainId: 2 },
    DE: { url: "https://www.amazon.de", currency: "EUR", domainId: 3 },
    FR: { url: "https://www.amazon.fr", currency: "EUR", domainId: 4 },
    IT: { url: "https://www.amazon.it", currency: "EUR", domainId: 8 },
    ES: { url: "https://www.amazon.es", currency: "EUR", domainId: 9 },
    NL: { url: "https://www.amazon.nl", currency: "EUR" },
    BE: { url: "https://www.amazon.com.be", currency: "EUR" },
    PL: { url: "https://www.amazon.pl", currency: "PLN" },
    SE: { url: "https://www.amazon.se", currency: "SEK" },
    IR: { url: "https://www.amazon.ie", currency: "IRR" },
    // TR: { url: 'https://www.amazon.com.tr', currency: 'TRY' },

    JP: { url: "https://www.amazon.co.jp", currency: "JPY", domainId: 5 },
    IN: { url: "https://www.amazon.in", currency: "INR", domainId: 10 },
    AU: { url: "https://www.amazon.com.au", currency: "AUD" },
    SG: { url: "https://www.amazon.sg", currency: "SGD" },

    AE: { url: "https://www.amazon.ae", currency: "AED" },
    SA: { url: "https://www.amazon.sa", currency: "SAR" },
} as const;

export const COUNTRY_REGIONS: Record<string, CountryCode[]> = {
    Americas: ["US", "CA", "MX", "BR"],
    Europe: ["UK", "DE", "FR", "IT", "ES", "NL", "BE", "PL", "SE", "IR"],
    "Asia Pacific": ["JP", "IN", "SG"],
    "Middle East": ["AE", "SA"],
} as const;

export const KeepaDomain = Object.entries(AMAZON_MARKETPLACES).reduce(
    (acc, [code, marketplace]) => {
        if ("domainId" in marketplace) {
            // @ts-ignore
            acc[code] = marketplace.domainId;
        }
        return acc;
    },
    {} as {
        [K in keyof typeof AMAZON_MARKETPLACES as (typeof AMAZON_MARKETPLACES)[K] extends { domainId: number } ? K : never]: (typeof AMAZON_MARKETPLACES)[K] extends {
            domainId: number;
        }
            ? (typeof AMAZON_MARKETPLACES)[K]["domainId"]
            : never;
    }
);

export type KeepaDomain = (typeof KeepaDomain)[keyof typeof KeepaDomain];

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
