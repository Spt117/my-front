import { ADMIN_EMAIL, ADMIN_PASSWORD, PB_URL } from '@/library/utils/uri';
import PocketBase from 'pocketbase';
import { BeybladeProduct } from './types/beyblade';

class BeybladeService {
    private pb: PocketBase;
    private readonly collectionName = 'beyblade_products';

    constructor(pb: PocketBase) {
        this.pb = pb;
        this.pb.autoCancellation(false);
    }

    async authenticateAsUser() {
        try {
            if (this.pb.authStore.isValid) {
                return;
            }
            await this.pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
            console.log('🔑 Authenticated as admin');
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }

    /**
     * Crée un nouveau produit Beyblade
     */
    async create(data: Omit<BeybladeProduct, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>): Promise<BeybladeProduct> {
        await this.authenticateAsUser();
        try {
            const record = await this.pb.collection(this.collectionName).create(data);
            return record as unknown as BeybladeProduct;
        } catch (error: any) {
            console.error('Error creating beyblade product:', error);
            if (error.response && error.response.data) {
                console.error("🔍 Détails de l'erreur (data):", JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    /**
     * Met à jour un produit existant
     */
    async update(id: string, data: Partial<Omit<BeybladeProduct, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>>): Promise<BeybladeProduct> {
        await this.authenticateAsUser();
        try {
            const record = await this.pb.collection(this.collectionName).update(id, data);
            return record as unknown as BeybladeProduct;
        } catch (error: any) {
            console.error(`Error updating beyblade product ${id}:`, error);
            if (error.response && error.response.data) {
                console.error("🔍 Détails de l'erreur (data):", JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    /**
     * Récupère un produit par son ID
     */
    async getOne(id: string): Promise<BeybladeProduct | null> {
        await this.authenticateAsUser();
        try {
            const record = await this.pb.collection(this.collectionName).getOne(id);
            return record as unknown as BeybladeProduct;
        } catch (error) {
            console.log(`Error fetching beyblade product ${id}:`, error);
            return null;
        }
    }

    /**
     * Récupère le premier produit correspondant au filtre
     */
    async getFirstListItem(filter: string): Promise<BeybladeProduct> {
        await this.authenticateAsUser();
        try {
            const record = await this.pb.collection(this.collectionName).getFirstListItem(filter);
            return record as unknown as BeybladeProduct;
        } catch (error) {
            console.error(`Error fetching first list item with filter "${filter}":`, error);
            throw error;
        }
    }

    /**
     * Liste les produits avec pagination
     */
    async list(
        page: number = 1,
        perPage: number = 30,
        options?: { filter?: string; sort?: string }
    ): Promise<{ items: BeybladeProduct[]; totalItems: number; totalPages: number }> {
        await this.authenticateAsUser();
        try {
            const result = await this.pb.collection(this.collectionName).getList(page, perPage, options);
            return {
                items: result.items as unknown as BeybladeProduct[],
                totalItems: result.totalItems,
                totalPages: result.totalPages,
            };
        } catch (error) {
            console.error('Error listing beyblade products:', error);
            throw error;
        }
    }

    /**
     * Récupère tous les produits (attention si beaucoup de données)
     */
    async getFullList(options?: { filter?: string; sort?: string }): Promise<BeybladeProduct[]> {
        await this.authenticateAsUser();
        try {
            const records = await this.pb.collection(this.collectionName).getFullList(options);
            return records as unknown as BeybladeProduct[];
        } catch (error) {
            console.error('Error fetching full list of beyblade products:', error);
            throw error;
        }
    }

    /**
     * Récupère le produit correspondant au productCode
     */
    async getOneByProductCode(productCode: string): Promise<BeybladeProduct | null> {
        await this.authenticateAsUser();
        try {
            const record = await this.pb.collection(this.collectionName).getFirstListItem(`productCode = "${productCode}"`);
            return record as unknown as BeybladeProduct;
        } catch (error) {
            console.log(`Error fetching beyblade product with productCode "${productCode}":`, error);
            return null;
        }
    }

    /**
     * Récupère le produit correspondant au slug
     */
    async getOneBySlug(slug: string): Promise<BeybladeProduct | null> {
        await this.authenticateAsUser();
        try {
            const record = await this.pb.collection(this.collectionName).getFirstListItem(`slug = "${slug}"`);
            return record as unknown as BeybladeProduct;
        } catch (error) {
            console.log(`Error fetching beyblade product with slug "${slug}":`, error);
            return null;
        }
    }

    /**
     * Récupère une liste allégée de tous les produits (uniquement références et titres)
     */
    async getProductReferences(): Promise<Pick<BeybladeProduct, 'id' | 'series' | 'productCode' | 'product' | 'title' | 'slug' | 'releaseType'>[]> {
        await this.authenticateAsUser();
        try {
            // L'option 'fields' permet de ne récupérer que les colonnes nécessaires
            // L'option 'sort' est facultative mais pratique pour avoir une liste ordonnée
            const records = await this.pb.collection(this.collectionName).getFullList({
                fields: 'id,series,productCode,product,title,slug,releaseType',
                sort: 'series,productCode',
            });

            // On caste le résultat avec Pick pour garantir le typage strict sur les champs demandés
            return records as unknown as Pick<BeybladeProduct, 'id' | 'series' | 'productCode' | 'product' | 'title' | 'slug' | 'releaseType'>[];
        } catch (error) {
            console.error('Error fetching product references:', error);
            throw error;
        }
    }

    static instance: BeybladeService = new BeybladeService(new PocketBase(PB_URL));

    static getInstance(): BeybladeService {
        return this.instance;
    }
}

export const beybladeService = BeybladeService.getInstance();
