"use client";
import { Input } from "@/components/ui/input";
import { useGetAsins } from "@/library/hooks/useGetAsins";
import { marketPlaceEnum, TMarketPlace } from "@/library/models/asins/asinType";
import { createAsinAction } from "@/library/models/asins/middlewareAsin";
import { useState } from "react";
import Selecteur from "../selecteur";
import { Button } from "../ui/button";
import { Spinner } from "../ui/shadcn-io/spinner/index";
import CheckAsins from "./CheckAsins";

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [marketPlace, setMarketPlace] = useState<TMarketPlace | null>(null);
    const [asin, setAsin] = useState<string>("");
    const { getAsins } = useGetAsins();

    const handleSubmit = async () => {
        if (!asin || !marketPlace) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        if (asin.length !== 10) {
            alert("L'ASIN doit comporter 10 caractères.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await createAsinAction(asin, marketPlace);

            setAsin("");
            setMarketPlace(null);
            await getAsins();
        } catch (error) {
            console.error("Error in handleSubmit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const options = marketPlaceEnum.map((option) => ({
        label: option,
        value: option,
    }));

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="ASIN" className="w-full md:w-[300px] rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
            <Selecteur placeholder="Choisir un marché" value={marketPlace} onChange={(m) => setMarketPlace(m as TMarketPlace)} array={options} />
            {!isLoading && (
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer">
                    Valider
                </Button>
            )}
            {isLoading && <Spinner className="h-6 w-6 text-blue-500" />}
            <CheckAsins />
        </div>
    );
}
