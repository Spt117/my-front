import { RecordModel } from "pocketbase";
import {
    IProspectColissimo,
    IProspectColissimoInput,
} from "../types/prospectColissimo";
import { pocketBaseManager } from "./Manager";

interface IProspectColissimoRecord extends Omit<IProspectColissimo, "emails" | "phones">, RecordModel {
    emails: unknown;
    phones: unknown;
}

function toPlain(r: IProspectColissimoRecord): IProspectColissimo {
    return {
        id: r.id,
        domain: r.domain,
        emails: Array.isArray(r.emails) ? (r.emails as string[]) : [],
        phones: Array.isArray(r.phones) ? (r.phones as string[]) : [],
        status: r.status,
        notes: r.notes,
        created: r.created,
        updated: r.updated,
    };
}

class ProspectColissimoService {
    private readonly collectionName = "prospects_colissimo";

    private get collection() {
        return pocketBaseManager.pb.collection(this.collectionName);
    }

    async getAll(): Promise<IProspectColissimo[]> {
        await pocketBaseManager.ensureAdmin();
        const records = await this.collection.getFullList<IProspectColissimoRecord>({ sort: "-updated" });
        return records.map(toPlain);
    }

    async getByDomain(domain: string): Promise<IProspectColissimo | null> {
        await pocketBaseManager.ensureAdmin();
        try {
            const record = await this.collection.getFirstListItem<IProspectColissimoRecord>(
                this.collection.client.filter("domain = {:domain}", { domain })
            );
            return toPlain(record);
        } catch {
            return null;
        }
    }

    async create(data: IProspectColissimoInput): Promise<IProspectColissimo> {
        await pocketBaseManager.ensureAdmin();
        const record = await this.collection.create<IProspectColissimoRecord>({
            domain: data.domain,
            emails: dedupe(data.emails ?? []),
            phones: dedupe(data.phones ?? []),
            status: data.status ?? "a_prospecter",
            notes: data.notes ?? "",
        });
        return toPlain(record);
    }

    async update(id: string, data: Partial<IProspectColissimoInput>): Promise<IProspectColissimo> {
        await pocketBaseManager.ensureAdmin();
        const payload: Record<string, unknown> = {};
        if (data.domain !== undefined) payload.domain = data.domain;
        if (data.emails !== undefined) payload.emails = dedupe(data.emails);
        if (data.phones !== undefined) payload.phones = dedupe(data.phones);
        if (data.status !== undefined) payload.status = data.status;
        if (data.notes !== undefined) payload.notes = data.notes;
        const record = await this.collection.update<IProspectColissimoRecord>(id, payload);
        return toPlain(record);
    }

    async remove(id: string): Promise<void> {
        await pocketBaseManager.ensureAdmin();
        await this.collection.delete(id);
    }
}

function dedupe(values: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of values) {
        const t = v.trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
    }
    return out;
}

export const prospectColissimoService = new ProspectColissimoService();
