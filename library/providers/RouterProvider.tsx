import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBasePath } from "../hooks/useBasePath";
import useUserStore from "../stores/UserStore";

export default function RouterProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { status } = useSession();
    const router = useRouter();
    const basePath = useBasePath();
    const { user } = useUserStore();

    useEffect(() => {
        const redirect = async () => {
            if (status === "unauthenticated") router.push("/boarding");
            else if (user && basePath === "/boarding") router.push("/");
        };
        if (basePath) redirect();
    }, [status, basePath, user]);

    return <>{children}</>;
}
