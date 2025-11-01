import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import useBeybladeStore from "../beybladeStore";
import ImageManager from "../ImageManager";
import AddContentItem from "./AddContentItem";
import Asins from "./Asins";
import ProductType from "./ProductType";

export default function ProductData() {
    const { beybladeProduct, updateProduct, addImage, removeImage } = useBeybladeStore();

    if (beybladeProduct)
        return (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                        <CardDescription>Essential details about the product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ProductType />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-code">Product Code *</Label>
                                <Input
                                    id="product-code"
                                    value={beybladeProduct.productCode || ""}
                                    onChange={(e) => updateProduct("productCode", e.target.value)}
                                    placeholder="e.g., BX-01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="release-date">Release Date *</Label>
                                <Input
                                    id="release-date"
                                    type="date"
                                    value={
                                        beybladeProduct.releaseDate
                                            ? new Date(beybladeProduct.releaseDate).toISOString().split("T")[0]
                                            : ""
                                    }
                                    onChange={(e) => updateProduct("releaseDate", new Date(e.target.value))}
                                />
                            </div>
                        </div>

                        <Separator />

                        <Asins />
                        <Separator />
                    </CardContent>
                </Card>
            </>
        );
}
