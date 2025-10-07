import { Button } from "@/components/ui/button";
import { CardAction } from "@/components/ui/card";
import useCreateStore from "./storeCreate";

export default function AddProduct() {
    const { selectedNiche, setSelectedNiche, selectedProduct, setSelectedProduct, size, setSize, namePokemon, setNamePokemon } =
        useCreateStore();
    if (!selectedNiche || !selectedProduct) return null;

    const disableAdd = selectedProduct === "peluche pokémon" && (!namePokemon || !size);

    return (
        <CardAction className="flex justify-end">
            <Button disabled={disableAdd}>Ajouter</Button>
        </CardAction>
    );
}
