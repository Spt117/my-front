import { beybladePacks } from '@/app/oldBeyblade/model/typesBeyblade';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useBeybladeStore from '../beybladeStore';

export default function ProductType() {
    const { beybladeProduct, updateProduct } = useBeybladeStore();

    if (!beybladeProduct) return null;

    return (
        <div className="space-y-2">
            <Label htmlFor="product-type">Product Type *</Label>
            <Select value={beybladeProduct.product || ''} onValueChange={(v) => updateProduct('product', v as any)}>
                <SelectTrigger id="product-type">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    {beybladePacks.map((type) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
