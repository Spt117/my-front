import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBasePath } from "../hooks/useBasePath";

export default function RouterProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { status } = useSession();
    const router = useRouter();
    const basePath = useBasePath();

    useEffect(() => {
        const redirect = async () => {
            if (status === "unauthenticated") router.push("/boarding");
            else if (basePath === "/boarding") router.push("/");
        };
        if (basePath) redirect();
    }, [status, basePath]);

    if (status === "unauthenticated" && basePath !== "/boarding") return null;
    else return <>{children}</>;
}
