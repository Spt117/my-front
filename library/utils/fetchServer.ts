"use server";
import { uriServerAcces } from "./uri";

export async function postServer(url: string, data: any) {
    let body = typeof data === "string" ? data : JSON.stringify(data);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${uriServerAcces}`,
            },
            body: body,
        });
        const json = await response.json();
        return json;
    } catch (e) {
        console.error("Erreur lors de l'envoi de la requête postserver: ", e);
        return null;
    }
}

export async function getServer(url: string) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${uriServerAcces}`,
            },
        });
        const json = await response.json();
        return json;
    } catch (e) {
        console.error("Erreur lors de l'envoi de la requête getserver: ", e);
        return null;
    }
}
