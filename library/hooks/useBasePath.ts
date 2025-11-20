import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useBasePath = () => {
    const [basePath, setBasePath] = useState<string>("");
    const path = usePathname();

    useEffect(() => {
        const segments = path.split("/");
        const basePath = segments.length > 1 ? `/${segments[1]}` : path;
        setBasePath(basePath);
    }, [path]);

    return basePath;
};
