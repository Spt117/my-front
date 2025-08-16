"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assurez-vous que le chemin pointe vers les composants select de Shadcn
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { marketPlaceEnum, TAsin, TMarketPlace } from "@/library/models/asins/asinType";
import { createAsinAction } from "@/library/models/asins/middlewareAsin";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [marketPlace, setMarketPlace] = useState<TMarketPlace | null>(null);
    const [asin, setAsin] = useState<string>("");

    const handleSubmit = async () => {
        console.log("handleSubmit called", { asin, marketPlace });

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
            const data: TAsin = {
                asin: asin,
                alerte: [
                    {
                        marketPlace: marketPlace,
                        endOfAlerte: false,
                    },
                ],
            };

            console.log("Calling createAsinAction with:", data);
            const result = await createAsinAction(data);
            console.log("createAsinAction result:", result);

            setAsin("");
            setMarketPlace(null);
        } catch (error) {
            console.error("Error in handleSubmit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Input value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="ASIN" className="w-full md:w-[300px] rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
                <Select onValueChange={(e) => setMarketPlace(e as TMarketPlace)}>
                    <SelectTrigger className="w-full md:w-[200px] rounded-lg border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                        <SelectValue placeholder="Choisir un marché !!!" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 bg-white shadow-lg">
                        {marketPlaceEnum.map((option) => (
                            <SelectItem key={option} value={option} className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 transition-colors">
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!isLoading && (
                    <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer">
                        Valider
                    </Button>
                )}
                {isLoading && <Spinner className="h-6 w-6 text-blue-500" />}
            </div>
        </div>
    );
}
