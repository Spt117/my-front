import { KeepaResponse } from './type';

/**
 * Extracts the last known price from the Keepa response.
 * Prioritizes Amazon price, then New price.
 *
 * @param response The KeepaResponse object.
 * @returns The last price as a number, or null if not available.
 */
export function getLastPrice(response: KeepaResponse) {
    if (!response.products || response.products.length === 0) {
        console.log('getLastPrice: No products found in response');
        return null;
    }

    const product = response.products[0];
    const csv = product.csv;

    if (!csv) {
        console.log('getLastPrice: No CSV data found for product');
        return null;
    }

    // Helper to get the last valid price from a CSV history array
    const getLastValidPrice = (history: number[] | null, label: string): number | null => {
        if (!history || history.length < 2) {
            console.log(`getLastPrice: History for ${label} is empty or insufficient`);
            return null;
        }
        // The array is structured as [time, price, time, price, ...]
        // We check the last entry.
        const lastPrice = history[history.length - 1];
        if (lastPrice === -1) {
            console.log(`getLastPrice: Last price for ${label} is -1 (unavailable)`);
            return null;
        }
        return lastPrice;
    };

    // Index 0 is Amazon, Index 1 is Marketplace New
    const amazonPrice = getLastValidPrice(csv[0], 'Amazon');
    if (amazonPrice !== null) {
        return amazonPrice;
    }

    const newPrice = getLastValidPrice(csv[1], 'New');
    if (newPrice === null) {
        console.log('getLastPrice: No valid price found for Amazon or New');
    }
    return newPrice;
}
