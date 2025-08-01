import { getUserFromHeader } from "../auth/secureServer";
import StoreProvider from "./StoreProvider";

export default async function BackendProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = await getUserFromHeader();
    return <StoreProvider user={user}>{children}</StoreProvider>;
}
