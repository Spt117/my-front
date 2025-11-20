import { postServer } from "./fetchServer";
import { telegram } from "./uri";

export async function sendToTelegram(message: string, receiver: string) {
    const body = {
        receiver,
        message,
    };
    await postServer(telegram.api, body);
}
