// Applique les migrations library/migrations/*.js via le SDK JS PocketBase.
// Usage: node library/migrations/apply.mjs
// Nécessite les env POCKETBASE_URI, PB_ADMIN_EMAIL, POCKETBASE_PASSWORD.

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Chargement .env.local (lecture minimale)
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
    } catch {
        // ignoré si fichier absent
    }
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
console.log(`[migrations] Admin connecté sur ${PB_URL}`);

// --- Mini-sandbox pour les migrations JS PocketBase ---
// On simule `migrate(up, down)`, `new Collection(data)` et `app.save/app.delete/app.findCollectionByNameOrId`
// en les mappant sur le SDK JS (pb.collections.*).

class MigrationCollection {
    constructor(data) {
        Object.assign(this, data);
    }
}

async function applyMigrationFile(filePath) {
    const source = await readFile(filePath, "utf8");

    let upFn = null;
    let downFn = null;

    const sandbox = {
        migrate: (up, down) => {
            upFn = up;
            downFn = down;
        },
        Collection: MigrationCollection,
    };

    // Exécution du code de migration dans le sandbox
    const fn = new Function(...Object.keys(sandbox), source);
    fn(...Object.values(sandbox));

    if (!upFn) throw new Error(`Migration ${filePath} n'appelle pas migrate()`);

    const app = {
        save: async (collection) => {
            const data = { ...collection };
            // PB v0.23+ utilise le champ "fields". On adapte les autodate -> PB gère nativement.
            try {
                const existing = await pb.collections.getOne(data.name);
                console.log(`[migrations] Collection ${data.name} existe déjà, skip`);
                return existing;
            } catch {
                const created = await pb.collections.create(data);
                console.log(`[migrations] Collection ${data.name} créée`);
                return created;
            }
        },
        delete: async (collection) => {
            await pb.collections.delete(collection.id ?? collection.name);
            console.log(`[migrations] Collection ${collection.name ?? collection.id} supprimée`);
        },
        findCollectionByNameOrId: async (nameOrId) => pb.collections.getOne(nameOrId),
    };

    await upFn(app);
}

const files = (await readdir(__dirname))
    .filter((f) => f.endsWith(".js"))
    .sort();

for (const file of files) {
    console.log(`[migrations] Applique ${file}`);
    await applyMigrationFile(join(__dirname, file));
}

console.log("[migrations] Terminé");
