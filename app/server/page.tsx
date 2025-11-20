import ScanVeille from "./ScanVeille";
import HomeKeys from "./keysAmazon/HomeKeys";
import CacheWebhook from "./CacheWebhook";

export interface dataStock {
    domain: string;
    sku: string;
}

export default async function Page() {
    return (
        <>
            <ScanVeille />
            <HomeKeys />
            <CacheWebhook />
        </>
    );
}
