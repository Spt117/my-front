import { Input } from "@/components/ui/input";
import { FileText, Ruler } from "lucide-react";
import { useAffiliationTask } from "./ContextTaskAffiliation";

export default function Inputs() {
    const { size, setSize, productType, setNamePokemon, namePokemon } = useAffiliationTask();

    if (productType === "peluche pokémon")
        return (
            <>
                <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-500" />
                    <span className="text-sm flex items-center">Taille:</span>
                    <Input
                        type="number"
                        placeholder="Taille en cm"
                        className="w-max h-7"
                        value={size || ""}
                        onChange={(e) => setSize(Number(e.target.value))}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm flex items-center">Nom:</span>
                    <Input
                        type="text"
                        placeholder="Nom du Pokémon"
                        className="w-max h-7"
                        value={namePokemon}
                        onChange={(e) => setNamePokemon(e.target.value)}
                    />
                </div>
            </>
        );
}
