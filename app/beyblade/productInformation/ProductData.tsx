import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useBeybladeStore from "../beybladeStore";
import Asins from "./Asins";
import ProductSystem from "./ProductSystem";
import { beybladeBrands, beybladePacks } from "../model/typesBeyblade";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
                        <div className="flex gap-8 flex-wrap">
                            <ProductType />
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={beybladeProduct.title || ""} onChange={(e) => updateProduct("title", e.target.value)} placeholder="e.g., Dran Buster 3-60F" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
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
                                <Label htmlFor="product-code">Product Code</Label>
                                <Input id="product-code" value={beybladeProduct.productCode || ""} onChange={(e) => updateProduct("productCode", e.target.value)} placeholder="BX-01" />
                            </div>
                            <ProductSystem />
                            <div className="space-y-2">
                                <Label htmlFor="content-number">Content number</Label>
                                <Input id="content-number" type="number" value={beybladeProduct.content || ""} onChange={(e) => updateProduct("content", Number(e.target.value))} placeholder="Number of products" />
                            </div>{" "}
                            <div className="space-y-2">
                                <Label htmlFor="release-date">Release Date</Label>
                                <Input id="release-date" type="date" value={beybladeProduct.releaseDate ? new Date(beybladeProduct.releaseDate).toISOString().split("T")[0] : ""} onChange={(e) => updateProduct("releaseDate", new Date(e.target.value))} />
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
