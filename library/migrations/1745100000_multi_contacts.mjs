// Migration : transforme les champs uniques email / phone en tableaux emails / phones (json).
// Idempotente : peut être relancée sans effet de bord.
//
// Usage :
//   node library/migrations/1745100000_multi_contacts.mjs

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadDotEnvLocal() {
    const envPath = join(__dirname, "..", "..", ".env.local");
    try {
        const raw = await readFile(envPath, "utf8");
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eq = trimmed.indexOf("=");
            if (eq < 0) continue;
            const key = trimmed.slice(0, eq).trim();
            let value = trimmed.slice(eq + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!(key in process.env)) process.env[key] = value;
        }
    } catch {}
}
await loadDotEnvLocal();

const PB_URL = process.env.POCKETBASE_URI;
const PB_EMAIL = process.env.PB_ADMIN_EMAIL || process.env.USER_EMAIL;
const PB_PASSWORD = process.env.POCKETBASE_PASSWORD;
if (!PB_URL || !PB_EMAIL || !PB_PASSWORD) {
    console.error("POCKETBASE_URI / PB_ADMIN_EMAIL / POCKETBASE_PASSWORD manquants");
    process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);
await pb.collection("_superusers").authWithPassword(PB_EMAIL, PB_PASSWORD);
console.log(`[multi_contacts] Admin connecté sur ${PB_URL}`);

const collection = await pb.collections.getOne("prospects_colissimo");
const fields = collection.fields ?? [];
const hasEmailsField = fields.some((f) => f.name === "emails");
const hasPhonesField = fields.some((f) => f.name === "phones");
const hasEmailField = fields.some((f) => f.name === "email");
const hasPhoneField = fields.some((f) => f.name === "phone");

// 1) Ajoute emails / phones si absents (json)
const updatedFields = [...fields];
if (!hasEmailsField) {
    updatedFields.push({
        name: "emails",
        type: "json",
        required: false,
        maxSize: 100000,
    });
}
if (!hasPhonesField) {
    updatedFields.push({
        name: "phones",
        type: "json",
        required: false,
        maxSize: 100000,
    });
}
if (!hasEmailsField || !hasPhonesField) {
    await pb.collections.update(collection.id, { fields: updatedFields });
    console.log("[multi_contacts] Champs json emails / phones ajoutés");
} else {
    console.log("[multi_contacts] Champs emails / phones déjà présents");
}

// 2) Migre les records existants
const records = await pb.collection("prospects_colissimo").getFullList();
let migrated = 0;
for (const r of records) {
    const patch = {};
    const existingEmails = Array.isArray(r.emails) ? r.emails : [];
    const existingPhones = Array.isArray(r.phones) ? r.phones : [];

    if (existingEmails.length === 0 && r.email) patch.emails = [r.email];
    if (existingPhones.length === 0 && r.phone) patch.phones = [r.phone];

    if (Object.keys(patch).length > 0) {
        await pb.collection("prospects_colissimo").update(r.id, patch);
        migrated++;
    }
}
console.log(`[multi_contacts] ${migrated} record(s) migré(s) (sur ${records.length})`);

// 3) Retire les anciens champs email / phone si encore présents
if (hasEmailField || hasPhoneField) {
    const remaining = updatedFields.filter((f) => f.name !== "email" && f.name !== "phone");
    await pb.collections.update(collection.id, { fields: remaining });
    console.log("[multi_contacts] Anciens champs email / phone supprimés");
} else {
    console.log("[multi_contacts] Anciens champs déjà retirés");
}

console.log("[multi_contacts] Terminé");
