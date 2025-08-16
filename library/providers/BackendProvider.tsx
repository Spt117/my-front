import { getServerSession } from "next-auth";
import { getUserFromHeader } from "../auth/secureServer";
import { userEmail } from "../utils/uri";
import StoreProvider from "./StoreProvider";
import { authOptions } from "../auth/authOption";

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = await getUserFromHeader();
    const session = await getServerSession(authOptions);

    if (!session || session.user?.email === userEmail) return <StoreProvider user={user}>{children}</StoreProvider>;

    return null;
}
