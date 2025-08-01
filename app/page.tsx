import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/library/auth/authOption";
import Test from "./accueil/test";

export default async function Home() {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
            <h1 className="text-3xl font-bold">Bienvenue sur Amalerte</h1>
            <Test />
            <Input placeholder="Nom d'utilisateur" />

            <Button>Se connecter</Button>

            <div className="flex items-center gap-2">
                <Checkbox id="newsletter" />
                <label htmlFor="newsletter" className="text-sm">
                    Recevoir les alertes
                </label>
            </div>

            <div className="flex items-center gap-2">
                <Switch id="mode" />
                <label htmlFor="mode" className="text-sm">
                    Mode sombre
                </label>
            </div>
        </div>
    );
}
