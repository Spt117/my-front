import PocketBase from "pocketbase";
import { PB_PASSWORD, PB_URL, userEmail } from "../utils/uri";

class PocketBaseManager {
    private static _instance: PocketBaseManager;
    private _pb: PocketBase;
    private isAdminConnected: boolean = false;

    private constructor(url: string = PB_URL) {
        this._pb = new PocketBase(url);
    }

    static get instance(): PocketBaseManager {
        if (!PocketBaseManager._instance) {
            PocketBaseManager._instance = new PocketBaseManager();
        }
        return PocketBaseManager._instance;
    }

    get pb(): PocketBase {
        return this._pb;
    }

    get isAuthenticated(): boolean {
        return this._pb.authStore.isValid;
    }

    async connectAsAdmin(): Promise<void> {
        if (this.isAuthenticated && this.isAdminConnected) {
            return;
        }

        try {
            await this._pb.collection("_superusers").authWithPassword(userEmail, PB_PASSWORD);
            this.isAdminConnected = true;
        } catch (error: any) {
            this.isAdminConnected = false;
            throw error;
        }
    }

    async ensureAdmin(): Promise<void> {
        if (!this.isAuthenticated || !this.isAdminConnected) {
            await this.connectAsAdmin();
        }
    }

    logout(): void {
        this._pb.authStore.clear();
        this.isAdminConnected = false;
    }
}

export const pocketBaseManager = PocketBaseManager.instance;
