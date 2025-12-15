import { beybladeGenerations, TBeybladeGeneration } from '@/app/oldBeyblade/model/typesBeyblade';
import SelectFull from '@/components/header/SelectFull';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useBeybladeStore from './beybladeStore';

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
        <div className="flex">
            <SelectFull action={handleSelectGeneration} options={array} currentValue={generation} />
            <Button className="ml-4">
                <Link href="/beyblade/review">Reviews</Link>
            </Button>
        </div>
    );
}
