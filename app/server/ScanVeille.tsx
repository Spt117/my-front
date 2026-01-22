"use client";
import { launchVeille, rebootVeilleAction } from "@/components/shopify/serverActions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ScanVeille() {
    const handleclic = async () => {
        try {
            const res = await launchVeille();
            if (res?.response) toast.success(res.response);
        } catch (error) {
            console.log(error);
            toast.error("Une erreur est survenue lors du lancement de la veille.");
        }
    };

    const rebootVeille = async () => {
        const res = await rebootVeilleAction();
        if (res?.response) toast.success(res.response);
    };

    return (
        <div className="p-4">
            <Button onClick={handleclic}>Lancer nouvelle veille Amazon </Button>
            <Button className="ml-4" onClick={rebootVeille}>
                Relancer la veille
            </Button>
        </div>
    );
}
