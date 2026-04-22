import { RecordModel } from "pocketbase";
import {
    IProspectColissimo,
    IProspectColissimoInput,
} from "../types/prospectColissimo";
import { pocketBaseManager } from "./Manager";

interface IProspectColissimoRecord extends IProspectColissimo, RecordModel {}

class ProspectColissimoService {
    private readonly collectionName = "prospects_colissimo";

    private get collection() {
        return pocketBaseManager.pb.collection(this.collectionName);
    }

    async getAll(): Promise<IProspectColissimo[]> {
        await pocketBaseManager.ensureAdmin();
        const records = await this.collection.getFullList<IProspectColissimoRecord>({ sort: "-updated" });
        return records;
    }

    async getByDomain(domain: string): Promise<IProspectColissimo | null> {
        await pocketBaseManager.ensureAdmin();
        try {
            const record = await this.collection.getFirstListItem<IProspectColissimoRecord>(
                this.collection.client.filter("domain = {:domain}", { domain })
            );
            return record;
        } catch {
            return null;
        }
    }

    async create(data: IProspectColissimoInput): Promise<IProspectColissimo> {
        await pocketBaseManager.ensureAdmin();
        const record = await this.collection.create<IProspectColissimoRecord>({
            domain: data.domain,
            email: data.email ?? "",
            phone: data.phone ?? "",
            status: data.status ?? "a_prospecter",
            notes: data.notes ?? "",
        });
        return record;
    }

    async update(id: string, data: Partial<IProspectColissimoInput>): Promise<IProspectColissimo> {
        await pocketBaseManager.ensureAdmin();
        const record = await this.collection.update<IProspectColissimoRecord>(id, data);
        return record;
    }

    async remove(id: string): Promise<void> {
        await pocketBaseManager.ensureAdmin();
        await this.collection.delete(id);
    }
}

export const prospectColissimoService = new ProspectColissimoService();
