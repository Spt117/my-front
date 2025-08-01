"use client";

import { setUserWithNextAuth } from "@/library/models/user/middlewareUser";
import { useEffect } from "react";

export default function Test() {
    useEffect(() => {
        setUserWithNextAuth("fr");
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
            <h1 className="text-3xl font-bold">Test Page</h1>
            <p>This is a test page for Amalerte.</p>
        </div>
    );
}
