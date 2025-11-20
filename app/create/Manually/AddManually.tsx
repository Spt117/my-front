"use client";
import Selecteur from "@/components/selecteur";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { niches, pokemonProducts } from "@/params/paramsCreateAffiliation";
import Inputs from "../ProductsTasks/Inputs";
import useAffiliationStore from "../storeTasksAffiliation";
import AddProduct from "./AddProduct";
import TypeProduct from "./TypeProduct";
import useCreateStore from "./storeCreate";

export default function AddManually() {
    const { websiteFilter } = useAffiliationStore();
    const { selectedNiche, setSelectedNiche, selectedProduct, updatePayloadPeluche, payloadPeluche, setAsin } = useCreateStore();

    const options = niches.map((niche) => ({ label: niche, value: niche }));
    const optionsProducts = pokemonProducts.map((product) => ({ label: product, value: product }));

    if (!websiteFilter) return null;
    return (
        <Card className="m-2 p-4">
            <CardHeader>Ajouter manuellement à {websiteFilter}</CardHeader>
            <CardContent className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded">
                <Input placeholder="Asin" className="max-w-xs" onChange={(e) => setAsin(e.target.value)} />
                <Selecteur placeholder="Select a niche" array={options} value={selectedNiche} onChange={setSelectedNiche} />
                <TypeProduct />
                {selectedNiche && selectedProduct && (
                    <Inputs
                        size={Number(payloadPeluche.size)}
                        setSize={(value) => updatePayloadPeluche("size", Number(value))}
                        productType={selectedProduct}
                        setNamePokemon={(value) => updatePayloadPeluche("namePokemon", value)}
                        namePokemon={payloadPeluche.namePokemon || ""}
                    />
                )}
                <AddProduct />
            </CardContent>
        </Card>
    );
}
