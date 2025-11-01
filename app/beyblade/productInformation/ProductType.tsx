import { beybladeBrands, beybladePacks } from "@/app/beyblade/model/typesBeyblade";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useBeybladeStore from "../beybladeStore";

export default function ProductType() {
    const { beybladeProduct, updateProduct } = useBeybladeStore();

    if (!beybladeProduct) return null;

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="product-type">Product Type *</Label>
                <Select value={beybladeProduct.product || ""} onValueChange={(v) => updateProduct("product", v as any)}>
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

            <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select value={beybladeProduct.brand || ""} onValueChange={(v) => updateProduct("brand", v as any)}>
                    <SelectTrigger id="brand">
                        <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                        {beybladeBrands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                                {brand}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    value={beybladeProduct.title || ""}
                    onChange={(e) => updateProduct("title", e.target.value)}
                    placeholder="e.g., Dran Buster 3-60F"
                />
            </div>
        </div>
    );
}
