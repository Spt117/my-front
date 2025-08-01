"use client";

import type { NextPage } from "next";
import { SignInOptions, signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { delay, isValidEmailByRegex } from "@/library/utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Frame: NextPage = () => {
    const [mail, setMail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await signIn("email", { email: mail, redirect: false });
        } catch (error) {
            console.log(error);
        } finally {
            setMail("");
            await delay(3000);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenue</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connecte-toi pour continuer</p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-700 dark:text-gray-300">
                        <p>📧 Envoi du lien de connexion...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse email</Label>
                            <Input id="email" type="email" placeholder="tommy@cypherwhale.com" value={mail} onChange={(e) => setMail(e.target.value)} />
                        </div>

                        <Button className="w-full" onClick={handleSubmit} disabled={!isValidEmailByRegex(mail)}>
                            Envoyer le lien de connexion
                        </Button>

                        <div className="flex items-center gap-2 text-center text-gray-400 text-sm">
                            <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                            ou
                            <span className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                        </div>

                        <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={async () => await signIn("google", { callbackUrl: "/" } as SignInOptions)}>
                            <Image src="/google.png" alt="Google" width={20} height={20} />
                            Se connecter avec Google
                        </Button>
                    </>
                )}
            </div>
        </main>
    );
};

export default Frame;
