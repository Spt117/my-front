"use client";

import { setUserWithNextAuth } from "@/library/models/user/middlewareUser";
import useUserStore from "@/library/stores/UserStore";
import { useEffect } from "react";

export default function Test() {
    const { user } = useUserStore();
    useEffect(() => {
        console.log(user);
    }, [user]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
            <h1 className="text-3xl font-bold">Test Page</h1>
            <p>This is a test page for Amalerte.</p>
        </div>
    );
}
