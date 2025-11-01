import SelectFull from "@/components/header/SelectFull";
import { beybladeGenerations } from "@/app/beyblade/model/typesBeyblade";

export default function HeaderBeyblade() {
    const array = beybladeGenerations.map((generation) => ({
        label: generation,
        value: generation,
    }));

    const handleSelectGeneration = (generation: string) => {
        console.log("Selected generation:", generation);
    };

    return (
        <div>
            <SelectFull action={handleSelectGeneration} options={array} currentValue={""} />
        </div>
    );
}
