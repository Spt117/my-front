import { RecordModel } from "pocketbase";
import { pocketBaseManager } from "./Manager";

// Interface pour les données de la collection Amazon (données PocketBase)
export interface IAmazonRecord {
    marketplace: string; // Domaine du marketplace (ex: "amazon.fr")
    isActive: boolean;
    host: string; // Host pour les appels API (ex: "webservices.amazon.fr")
    region: string; // Région AWS (ex: "eu-west-1")
    partnerTag: string; // Tag partenaire Amazon
    currency: string; // Devise (€, $, ¥, etc.)
    countryCode: string; // Code pays (fr, de, us, jp)
}

// Interface complète avec les champs PocketBase
export interface IAmazonRecordFull extends IAmazonRecord, RecordModel {}

/**
 * Interface IMarketplace - utilisée dans tout le code pour représenter un marketplace Amazon
 * Compatible avec l'ancienne interface statique de paramsAmazon.ts
 */
export interface IMarketplace {
    domain: string; // Domaine du marketplace (ex: "amazon.fr")
    host: string;
    region: string;
    partnerTag: string;
    currency: string;
    countryCode: string;
    isActive: boolean;
}

/**
 * Ressources Amazon PA-API demandées lors des appels
 */
export const ressourcesAmazon = [
    "ItemInfo.ByLineInfo",
    "ItemInfo.Title",
    "ItemInfo.Features",
    "ItemInfo.Classifications",
    "ItemInfo.ContentInfo",
    "ItemInfo.ProductInfo",
    // OffersV2 - nouvelle API recommandée par Amazon (remplace Offers)
    "OffersV2.Listings.Availability",
    "OffersV2.Listings.Condition",
    "OffersV2.Listings.IsBuyBoxWinner",
    "OffersV2.Listings.MerchantInfo",
    "OffersV2.Listings.Price",
    // Images
    "Images.Primary.Medium",
    "Images.Primary.Large",
    "Images.Variants.Medium",
    "Images.Variants.Large",
];

/**
 * Convertit un enregistrement PocketBase en IMarketplace
 */
function toMarketplace(record: IAmazonRecordFull): IMarketplace {
    return {
        domain: record.marketplace,
        host: record.host,
        region: record.region,
        partnerTag: record.partnerTag,
        currency: record.currency,
        countryCode: record.countryCode,
        isActive: record.isActive,
    };
}

/**
 * Service dédié à la gestion de la collection "amazon" dans PocketBase
 */
class AmazonService {
    private readonly collectionName = "amazon";

    /**
     * Accès direct à la collection via le manager
     */
    private get collection() {
        return pocketBaseManager.pb.collection(this.collectionName);
    }

    /**
     * S'assure qu'on est connecté avant chaque opération
     */
    private async ensureConnection(): Promise<void> {
        await pocketBaseManager.ensureAdmin();
    }

    // ========================================
    // MÉTHODES PRINCIPALES (retournent IMarketplace)
    // ========================================

    /**
     * Récupérer tous les marketplaces au format IMarketplace
     */
    async getAllMarketplaces(): Promise<IMarketplace[]> {
        const records = await this.getAll();
        return records.map(toMarketplace);
    }

    /**
     * Récupérer uniquement les marketplaces actifs au format IMarketplace
     */
    async getActiveMarketplaces(): Promise<IMarketplace[]> {
        const records = await this.getActive();
        return records.map(toMarketplace);
    }

    /**
     * Récupérer un marketplace par son domaine (ex: "amazon.fr")
     * @throws Error si le marketplace n'est pas trouvé
     */
    async getMarketplaceByDomain(domain: string): Promise<IMarketplace> {
        const record = await this.getByMarketplace(domain);
        if (!record) {
            throw new Error(`Marketplace non trouvé: ${domain}`);
        }
        return toMarketplace(record);
    }

    /**
     * Récupérer un marketplace par son domaine, retourne null si non trouvé
     */
    async getMarketplaceByDomainOrNull(domain: string): Promise<IMarketplace | null> {
        const record = await this.getByMarketplace(domain);
        return record ? toMarketplace(record) : null;
    }

    // ========================================
    // MÉTHODES CRUD (retournent IAmazonRecordFull)
    // ========================================

    /**
     * Créer un nouveau marketplace Amazon
     */
    async create(data: IAmazonRecord): Promise<IAmazonRecordFull> {
        await this.ensureConnection();
        try {
            const record = await this.collection.create<IAmazonRecordFull>(data);
            return record;
        } catch (error) {
            console.error("❌ Erreur création marketplace Amazon:", error);
            throw error;
        }
    }

    /**
     * Récupérer tous les marketplaces (données brutes PocketBase)
     */
    async getAll(): Promise<IAmazonRecordFull[]> {
        await this.ensureConnection();
        try {
            const records = await this.collection.getFullList<IAmazonRecordFull>();
            return records;
        } catch (error) {
            console.error("❌ Erreur récupération marketplaces Amazon:", error);
            throw error;
        }
    }

    /**
     * Récupérer uniquement les marketplaces actifs (données brutes PocketBase)
     */
    async getActive(): Promise<IAmazonRecordFull[]> {
        await this.ensureConnection();
        try {
            const records = await this.collection.getFullList<IAmazonRecordFull>({
                filter: "isActive = true",
            });
            return records;
        } catch (error) {
            console.error("❌ Erreur récupération marketplaces actifs:", error);
            throw error;
        }
    }

    /**
     * Récupérer un marketplace par son domaine (données brutes PocketBase)
     */
    async getByMarketplace(marketplace: string): Promise<IAmazonRecordFull | null> {
        await this.ensureConnection();
        try {
            const record = await this.collection.getFirstListItem<IAmazonRecordFull>(`marketplace = "${marketplace}"`);
            return record;
        } catch (error) {
            // Si pas trouvé, retourne null au lieu de throw
            return null;
        }
    }

    /**
     * Récupérer un marketplace par son ID
     */
    async getById(id: string): Promise<IAmazonRecordFull | null> {
        await this.ensureConnection();
        try {
            const record = await this.collection.getOne<IAmazonRecordFull>(id);
            return record;
        } catch (error) {
            return null;
        }
    }

    /**
     * Mettre à jour un marketplace
     */
    async update(id: string, data: Partial<IAmazonRecord>): Promise<IAmazonRecordFull> {
        await this.ensureConnection();
        try {
            const record = await this.collection.update<IAmazonRecordFull>(id, data);
            return record;
        } catch (error) {
            console.error(`❌ Erreur mise à jour marketplace ${id}:`, error);
            throw error;
        }
    }

    /**
     * Activer ou désactiver un marketplace
     */
    async setActive(id: string, isActive: boolean): Promise<IAmazonRecordFull> {
        return this.update(id, { isActive });
    }

    /**
     * Supprimer un marketplace
     */
    async delete(id: string): Promise<boolean> {
        await this.ensureConnection();
        try {
            await this.collection.delete(id);
            return true;
        } catch (error) {
            console.error(`❌ Erreur suppression marketplace ${id}:`, error);
            throw error;
        }
    }

    /**
     * Vérifie si un marketplace existe
     */
    async exists(marketplace: string): Promise<boolean> {
        const record = await this.getByMarketplace(marketplace);
        return record !== null;
    }

    /**
     * Créer ou mettre à jour un marketplace (upsert)
     */
    async upsert(data: IAmazonRecord): Promise<IAmazonRecordFull> {
        const existing = await this.getByMarketplace(data.marketplace);
        if (existing) {
            return this.update(existing.id, data);
        }
        return this.create(data);
    }
}

// Export de l'instance singleton
export const amazonService = new AmazonService();
