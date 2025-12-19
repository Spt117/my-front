'use server';
import { KeepaDomain } from '../utils/amazon';
import { keepaKey } from '../utils/uri';
import { KeepaResponse } from './type';

/**
 * Fetches product data from the Keepa API.
 *
 * @param domainId The Keepa domain ID (e.g., 1 for .com, 4 for .fr).
 * @param asin The ASIN of the product to fetch.
 * @returns A Promise that resolves to the KeepaResponse.
 */
export async function getKeepaProduct(domainId: KeepaDomain, asin: string): Promise<KeepaResponse | null> {
    const url = `https://api.keepa.com/product?key=${keepaKey}&domain=${domainId}&asin=${asin}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch Keepa data: ${response.status} ${response.statusText}`);
        }

        const data: KeepaResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Keepa product:', error);
        return null;
    }
}
