"use client";

import { Button } from "@/components/ui/button";
import type { NextPage } from "next";
import { SignInOptions, signIn } from "next-auth/react";
import Image from "next/image";

const Frame: NextPage = () => {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenue</h1>
                </div>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={async () => await signIn("google", { callbackUrl: "/" } as SignInOptions)}>
                    <Image src="/google.png" alt="Google" width={20} height={20} />
                    Se connecter avec Google
                </Button>
            </div>
        </main>
    );
};

export default Frame;
