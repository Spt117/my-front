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

    return <Button onClick={handleclic}>Lancer la veille Amazon</Button>;
}
