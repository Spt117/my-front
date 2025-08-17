"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketPlaceEnum, TMarketPlace } from "@/library/models/asins/asinType";
import { Button } from "../ui/button";
import { createAsinAction } from "@/library/models/asins/middlewareAsin";
import { Spinner } from "../ui/shadcn-io/spinner/index";

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [marketPlace, setMarketPlace] = useState<TMarketPlace | null>(null);
    const [asin, setAsin] = useState<string>("");

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
        } catch (error) {
            console.error("Error in handleSubmit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input onChange={(e) => setAsin(e.target.value)} placeholder="ASIN" className="w-full md:w-[300px] rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
            <div className="w-full md:w-[300px]">
                <Select onValueChange={(m) => setMarketPlace(m as TMarketPlace)}>
                    <SelectTrigger className="w-full md:w-[200px] rounded-lg border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                        <SelectValue placeholder="Choisir un marché" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 bg-white shadow-lg">
                        {marketPlaceEnum.map((option) => (
                            <SelectItem key={option} value={option} className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 transition-colors">
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {!isLoading && (
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear cursor-pointer">
                    Valider
                </Button>
            )}
            {isLoading && <Spinner className="h-6 w-6 text-blue-500" />}
        </div>
    );
}
