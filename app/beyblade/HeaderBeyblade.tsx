import { beybladeGenerations, TBeybladeGeneration } from "@/app/beyblade/model/typesBeyblade";
import SelectFull from "@/components/header/SelectFull";
import useBeybladeStore from "./beybladeStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeaderBeyblade() {
    const { generation, setGeneration } = useBeybladeStore();
    const array = beybladeGenerations.map((generation) => ({
        label: generation,
        value: generation,
    }));

    const handleSelectGeneration = (value: string) => {
        setGeneration(value as TBeybladeGeneration);
    };
    return (
        <div>
            <SelectFull action={handleSelectGeneration} options={array} currentValue={generation} />
            <Button className="ml-4" variant="link">
                <Link href="/beyblade/review">Review Beyblade Products</Link>
            </Button>
        </div>
    );
}
