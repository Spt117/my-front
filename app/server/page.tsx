import { authOptions } from "@/library/auth/authOption";
import { getServer } from "@/library/utils/fetchServer";
import { getServerSession } from "next-auth";
import DataFront from "./frontServer";
import ScanVeille from "./ScanVeille";

export interface dataStock {
    domain: string;
    sku: string;
}

export default async function Page() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const url = `http://localhost:9100/stock`;
    const res = (await getServer(url)) as dataStock[];
    console.log(res);

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <ScanVeille />
            {res.length > 0 && <DataFront data={res} />}
        </div>
    );
}
