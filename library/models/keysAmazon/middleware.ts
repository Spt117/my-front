"use server";
import { controllerAmazonKeys, TAmazonKeys } from "./keysDeploy";

export async function addKeys(params: TAmazonKeys) {
    const res = await controllerAmazonKeys.addOrUpdateKeyWithEncryption(params);
    return JSON.parse(JSON.stringify(res));
}
