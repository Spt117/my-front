import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useBeybladeStore from "../beybladeStore";

export default function Asins() {
    const { beybladeProduct, updateProduct } = useBeybladeStore();

    if (beybladeProduct)
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">ASIN Codes (Optional)</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="asin-europe" className="text-sm">
                            Europe
                        </Label>
                        <Input
                            id="asin-europe"
                            value={beybladeProduct.asinEurope || ""}
                            onChange={(e) => updateProduct("asinEurope", e.target.value)}
                            placeholder="B0XXXXXXXX"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="asin-america" className="text-sm">
                            America
                        </Label>
                        <Input
                            id="asin-america"
                            value={beybladeProduct.asinAmerica || ""}
                            onChange={(e) => updateProduct("asinAmerica", e.target.value)}
                            placeholder="B0XXXXXXXX"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="asin-japan" className="text-sm">
                            Japan
                        </Label>
                        <Input
                            id="asin-japan"
                            value={beybladeProduct.asinJapan || ""}
                            onChange={(e) => updateProduct("asinJapan", e.target.value)}
                            placeholder="B0XXXXXXXX"
                        />
                    </div>
                </div>
            </div>
        );
}
