import { authOptions } from "@/library/auth/authOption";
import { getServerSession } from "next-auth";
import ScanVeille from "./ScanVeille";

export interface dataStock {
    domain: string;
    sku: string;
}

export default async function Page() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return <ScanVeille />;
}
