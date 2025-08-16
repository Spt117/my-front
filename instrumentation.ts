import { sendToTelegram } from "./library/utils/telegram";
import { telegram } from "./library/utils/uri";

// instrumentation.ts
export async function register() {
    // Évite les doublons en dev/HMR
    if ((globalThis as any).__BOOT_LOGGED__) return;
    (globalThis as any).__BOOT_LOGGED__ = true;

    const isNode = typeof process !== "undefined" && !!process?.versions?.node;

    const payload = {
        when: new Date().toISOString(),
        env: process?.env?.NODE_ENV,
        pid: isNode ? process.pid : undefined,
        runtime: isNode ? `node ${process.version}` : "edge",
    };

    console.log("[BOOT] App démarrée ahahahahaahah", payload);
    const msg = `App démarrée ${payload.when} (${payload.env})`;
    sendToTelegram(msg, telegram.rapports);
}
