export const PROSPECT_STATUSES = ["a_prospecter", "en_attente", "archive"] as const;
export type TProspectStatus = (typeof PROSPECT_STATUSES)[number];

export const PROSPECT_STATUS_LABEL: Record<TProspectStatus, string> = {
    a_prospecter: "À prospecter",
    en_attente: "En attente de réponse",
    archive: "Archivé",
};

export interface IProspectColissimo {
    id: string;
    domain: string;
    emails: string[];
    phones: string[];
    status: TProspectStatus;
    notes: string;
    created: string;
    updated: string;
}

export interface IProspectColissimoInput {
    domain: string;
    emails?: string[];
    phones?: string[];
    status?: TProspectStatus;
    notes?: string;
}
