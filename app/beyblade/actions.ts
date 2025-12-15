'use server';

import { revalidatePath } from 'next/cache';
import { beybladeService } from './pocketbase/beyblade-service';
import { BeybladeProduct } from './pocketbase/types/beyblade';

export async function updateBeybladeProduct(id: string, data: Partial<BeybladeProduct>) {
    try {
        await beybladeService.update(id, data);
        revalidatePath('/beyblade', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update product', error);
        return { success: false, error: JSON.stringify(error) };
    }
}
