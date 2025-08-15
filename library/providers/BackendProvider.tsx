import { getUserFromHeader } from "../auth/secureServer";
import { userEmail } from "../utils/uri";
import StoreProvider from "./StoreProvider";

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = await getUserFromHeader();

    if (!user || user?.email === userEmail) return <StoreProvider user={user}>{children}</StoreProvider>;

    return null;
}
