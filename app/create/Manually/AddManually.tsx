"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Inputs from "../ProductsTasks/Inputs";
import { useState } from "react";
import Selecteur from "@/components/selecteur";
import { pokemonProducts, niches } from "@/library/params/paramsCreateAffiliation";
import useAffiliationStore from "../storeTasksAffiliation";
import useCreateStore from "./storeCreate";
import TypeProduct from "./TypeProduct";

export default function AddManually() {
    const { websiteFilter } = useAffiliationStore();
    const { selectedNiche, setSelectedNiche, selectedProduct, setSelectedProduct } = useCreateStore();

    const [size, setSize] = useState<number | null>(null);
    const [namePokemon, setNamePokemon] = useState<string>("");

    const options = niches.map((niche) => ({ label: niche, value: niche }));
    const optionsProducts = pokemonProducts.map((product) => ({ label: product, value: product }));

    if (!websiteFilter) return null;
    return (
        <Card className="m-2 p-4">
            <CardHeader>Ajouter manuellement à {websiteFilter}</CardHeader>
            <CardContent className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded">
                <Selecteur placeholder="Select a niche" array={options} value={selectedNiche} onChange={setSelectedNiche} />
                <TypeProduct />
            </CardContent>
            {selectedNiche && selectedProduct && (
                <CardContent className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded">
                    <Inputs
                        size={size}
                        setSize={setSize}
                        productType={selectedProduct}
                        setNamePokemon={setNamePokemon}
                        namePokemon={namePokemon}
                    />
                </CardContent>
            )}
        </Card>
    );
}
