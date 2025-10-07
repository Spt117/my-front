"use client";
import Selecteur from "@/components/selecteur";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { niches, pokemonProducts } from "@/library/params/paramsCreateAffiliation";
import Inputs from "../ProductsTasks/Inputs";
import useAffiliationStore from "../storeTasksAffiliation";
import AddProduct from "./AddProduct";
import useCreateStore from "./storeCreate";
import TypeProduct from "./TypeProduct";

export default function AddManually() {
    const { websiteFilter } = useAffiliationStore();
    const { selectedNiche, setSelectedNiche, selectedProduct, setSelectedProduct, size, setSize, namePokemon, setNamePokemon } =
        useCreateStore();

    const options = niches.map((niche) => ({ label: niche, value: niche }));
    const optionsProducts = pokemonProducts.map((product) => ({ label: product, value: product }));

    if (!websiteFilter) return null;
    return (
        <Card className="m-2 p-4">
            <CardHeader>Ajouter manuellement à {websiteFilter}</CardHeader>
            <CardContent className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded">
                <Selecteur placeholder="Select a niche" array={options} value={selectedNiche} onChange={setSelectedNiche} />
                <TypeProduct />
                {selectedNiche && selectedProduct && (
                    <Inputs
                        size={size}
                        setSize={setSize}
                        productType={selectedProduct}
                        setNamePokemon={setNamePokemon}
                        namePokemon={namePokemon}
                    />
                )}
                <AddProduct />
            </CardContent>
        </Card>
    );
}
