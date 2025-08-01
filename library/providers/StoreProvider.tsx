"use client";

import { useEffect } from "react";
import { TUser } from "../models/user/userType";
import useUserStore from "../stores/UserStore";

export default function StoreProvider({ children, user }: Readonly<{ children: React.ReactNode; user: TUser | null }>) {
    const { setUser } = useUserStore();

    useEffect(() => {
        if (user) setUser(user);
    }, [user]);

    return <>{children}</>;
}
