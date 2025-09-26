import { TDomainsShopify } from "@/library/params/paramsShopify";

// eventBus.ts
export type EventCallback<T = any> = (data: T) => void;

interface EventMap {
    [key: string]: any;
}

class CEvent<T extends EventMap = EventMap> {
    private events: { [K in keyof T]?: EventCallback<T[K]>[] } = {};

    on<K extends keyof T>(event: K, callback: EventCallback<T[K]>) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event]!.push(callback);
    }

    emit<K extends keyof T>(event: K, data: T[K]) {
        if (this.events[event]) {
            this.events[event]!.forEach((callback) => callback(data));
        }
    }

    off<K extends keyof T>(event: K, callback: EventCallback<T[K]>) {
        if (this.events[event]) {
            this.events[event] = this.events[event]!.filter((cb) => cb !== callback);
        }
    }

    // Méthode pour écouter un événement une seule fois
    once<K extends keyof T>(event: K, callback: EventCallback<T[K]>) {
        const onceCallback = (data: T[K]) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }

    // Méthode pour supprimer tous les listeners d'un événement
    removeAllListeners<K extends keyof T>(event?: K) {
        if (event) {
            this.events[event] = [];
        } else {
            this.events = {};
        }
    }

    // Méthode pour obtenir le nombre de listeners d'un événement
    listenerCount<K extends keyof T>(event: K): number {
        return this.events[event]?.length || 0;
    }
}

export interface AppEvents {
    "orders/paid": { shop: string };
    "orders/fulfilled": { name: string };
    "inventory_levels/update": { domain: TDomainsShopify };
    "products/update": { sku: string };
}
export const myEvents = new CEvent<AppEvents>();
