import { sendToTelegram } from "./library/utils/telegram";
import { telegram } from "./library/utils/uri";

// instrumentation.ts
export async function register() {
    // Évite les doublons en dev/HMR
    if ((globalThis as any).__BOOT_LOGGED__) return;
    (globalThis as any).__BOOT_LOGGED__ = true;

    const env = process?.env?.NODE_ENV;

    const msg = `App démarrée ${new Date().toISOString()} (${env})`;
    if (env === "development") console.log(msg);
    else sendToTelegram(msg, telegram.rapports);
}
