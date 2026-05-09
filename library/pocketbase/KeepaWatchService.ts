import { pocketBaseManager } from "./Manager";

// Service lecture seule côté front. Toutes les mutations passent par les routes
// pokemon (api.digiblock.fr) — voir my-front/app/amazon/keepa/serverAction.ts.

export interface IKeepaWatchRecord {
    asin: string;
    domainId: number;
    marketplaceCode: string;
    title: string;
    imageUrl: string;
    amazonAvailable: boolean;
    lastPrice: number;
    alertRestock: boolean;
    alertOutOfStock: boolean;
    trackingActive: boolean;
    lastChecked: string;
    lastStockChange: string;
    lastNotification: string;
}

export interface IKeepaWatchRecordFull extends IKeepaWatchRecord {
    id: string;
    created: string;
    updated: string;
}

export interface IKeepaSettings {
    singleton: string;
    webhookUrl: string;
    fallbackEnabled: boolean;
    fallbackIntervalHours: number;
    lastWebhookSync: string;
    // Note : webhookSecret est volontairement absent (masqué par l'API pokemon /keepa/settings).
}

export interface IKeepaSettingsFull extends IKeepaSettings {
    id: string;
    created: string;
    updated: string;
}

class KeepaWatchService {
    private readonly watchCollection = "keepa_watch";
    private readonly settingsCollection = "keepa_settings";

    private get watch() {
        return pocketBaseManager.pb.collection(this.watchCollection);
    }

    private get settings() {
        return pocketBaseManager.pb.collection(this.settingsCollection);
    }

    private async ensureConnection(): Promise<void> {
        await pocketBaseManager.ensureAdmin();
    }

    async getAll(): Promise<IKeepaWatchRecordFull[]> {
        await this.ensureConnection();
        // Pas de sort : la version PB déployée renvoie un 400 sur "-created"/"-updated"
        // (cf. EverwishProductService). Le tri est fait côté UI si besoin.
        return this.watch.getFullList<IKeepaWatchRecordFull>();
    }

    async getSettings(): Promise<IKeepaSettingsFull | null> {
        await this.ensureConnection();
        try {
            return await this.settings.getFirstListItem<IKeepaSettingsFull>(`singleton = "config"`);
        } catch {
            return null;
        }
    }
}

export const keepaWatchService = new KeepaWatchService();
