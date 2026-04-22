"use server";

import { prospectColissimoService } from "@/library/pocketbase/ProspectColissimoService";
import { IProspectColissimo, IProspectColissimoInput, TProspectStatus } from "@/library/types/prospectColissimo";
import { cleanDomainFromInput } from "./domain";

export async function findProspectByInput(input: string): Promise<{
    domain: string | null;
    prospect: IProspectColissimo | null;
}> {
    const domain = cleanDomainFromInput(input);
    if (!domain) return { domain: null, prospect: null };

    const prospect = await prospectColissimoService.getByDomain(domain);
    return { domain, prospect };
}

export async function createProspect(
    data: IProspectColissimoInput
): Promise<{ success: boolean; prospect?: IProspectColissimo; error?: string }> {
    const domain = cleanDomainFromInput(data.domain);
    if (!domain) return { success: false, error: "Nom de domaine invalide" };

    const existing = await prospectColissimoService.getByDomain(domain);
    if (existing) return { success: false, error: "Ce domaine existe déjà dans la base" };

    try {
        const prospect = await prospectColissimoService.create({ ...data, domain });
        return { success: true, prospect };
    } catch (err: any) {
        console.error("[Colissimo] Erreur création prospect:", err);
        return { success: false, error: err?.message || "Erreur interne" };
    }
}

export async function updateProspectStatus(
    id: string,
    status: TProspectStatus
): Promise<{ success: boolean; error?: string }> {
    try {
        await prospectColissimoService.update(id, { status });
        return { success: true };
    } catch (err: any) {
        console.error("[Colissimo] Erreur mise à jour statut:", err);
        return { success: false, error: err?.message || "Erreur interne" };
    }
}

export async function updateProspect(
    id: string,
    data: Partial<IProspectColissimoInput>
): Promise<{ success: boolean; prospect?: IProspectColissimo; error?: string }> {
    try {
        const prospect = await prospectColissimoService.update(id, data);
        return { success: true, prospect };
    } catch (err: any) {
        console.error("[Colissimo] Erreur mise à jour prospect:", err);
        return { success: false, error: err?.message || "Erreur interne" };
    }
}

export async function removeProspect(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prospectColissimoService.remove(id);
        return { success: true };
    } catch (err: any) {
        console.error("[Colissimo] Erreur suppression prospect:", err);
        return { success: false, error: err?.message || "Erreur interne" };
    }
}

export async function listProspects(): Promise<IProspectColissimo[]> {
    return prospectColissimoService.getAll();
}
