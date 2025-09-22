"use client";
import { Button } from "@/components/ui/button";
import { getServer } from "@/library/utils/fetchServer";
import { toast } from "sonner";

export default function ScanVeille() {
    const handleclic = async () => {
        try {
            const url = `http://localhost:9100/amazon/veille-launch`;
            const res = await getServer(url);
            toast.success(res.response);
        } catch (error) {
            console.log(error);
            toast.error("Une erreur est survenue lors du lancement de la veille.");
        }
    };

    const rebootVeille = async () => {
        const url = `http://localhost:9100/veille-action`;
        const res = await getServer(url);
        toast.success(res.response);
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
