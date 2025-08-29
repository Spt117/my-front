import AddAsin from "@/components/asin/add-asin";
import Asins from "@/components/asin/asins";
import { authOptions } from "@/library/auth/authOption";
import { getServerSession } from "next-auth";

export default async function Page() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <AddAsin />
            <hr />
            <Asins />
        </div>
    );
}
