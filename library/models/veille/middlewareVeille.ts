"use server";

import { veilleController } from "./veilleController";

export async function getVeillesByUser() {
    const res = await veilleController().getVeillesByUser();
    return res;
}

export async function addWebsiteToVeille(veilleId: string, website: string[]) {
    const res = await veilleController().addWebsiteToVeille(veilleId, website);
    return res;
}
