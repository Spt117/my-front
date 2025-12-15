import { beybladeSystem } from '@/app/oldBeyblade/model/typesBeyblade';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useBeybladeStore from '../beybladeStore';

export default function ProductSystem() {
    const { beybladeProduct, updateProduct, generation } = useBeybladeStore();

    if (!beybladeProduct) return null;

    const systemsForGeneration = beybladeSystem[generation];

    return (
        <div className="space-y-2">
            <Label htmlFor="product-type">Product System</Label>
            <Select value={beybladeProduct.system || ''} onValueChange={(v) => updateProduct('system', v as any)}>
                <SelectTrigger id="product-type">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    {systemsForGeneration.map((type) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
