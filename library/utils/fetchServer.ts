'use server';
import { uriServerAcces } from './uri';

export type IResponseFetch<T> = {
    error?: string;
    message?: string;
    response: T;
};

export async function postServer(url: string, data: any): Promise<IResponseFetch<any>> {
    let body = typeof data === 'string' ? data : JSON.stringify(data);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${uriServerAcces}`,
            },
            body: body,
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            return json;
        } else {
            const text = await response.text();
            console.error('Server returned non-JSON response:', text);
            return {
                response: null,
                error: `Le serveur a renvoyé une réponse invalide (${response.status}). Vérifiez les logs backend.`,
            };
        }
    } catch (e) {
        console.error(e);
        return { response: null, error: "Erreur lors de l'envoi de la requête au serveur" };
    }
}

export async function postServerOld(url: string, data: any) {
    let body = typeof data === 'string' ? data : JSON.stringify(data);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${uriServerAcces}`,
            },
            body: body,
        });
        const json = await response.json();
        return json;
    } catch (e) {
        console.error(e);
        return { response: null, error: "Erreur lors de l'envoi de la requête au serveur" };
    }
}

export async function getServer(url: string): Promise<IResponseFetch<any>> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${uriServerAcces}`,
            },
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            return json;
        } else {
            const text = await response.text();
            console.error('Server returned non-JSON response:', text);
            return {
                response: null,
                error: `Le serveur a renvoyé une réponse invalide (${response.status}).`,
            };
        }
    } catch (e) {
        console.error(e);
        return { response: null, error: "Erreur lors de l'envoi de la requête au serveur" };
    }
}
