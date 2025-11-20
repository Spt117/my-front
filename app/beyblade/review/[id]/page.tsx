"use client";

import { updateBeybladeAction } from "@/app/beyblade/model/product/middlewareProduct";
import { IBeybladeProduct } from "@/app/beyblade/model/typesBeyblade";
import useReviewStore from "@/app/beyblade/review/storeReview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
    const { item } = useReviewStore();
    const [product, setProduct] = useState<IBeybladeProduct | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setProduct(item);
        setHasUnsavedChanges(false);
    }, [item]);

    if (!product) return null;

    const handleProductUpdate = (field: keyof IBeybladeProduct, value: any) => {
        setProduct((prev) => {
            if (!prev) return prev;
            const updated: IBeybladeProduct = {
                ...prev,
                product: prev.product ?? null,
                generation: prev.generation,
                [field]: value,
            };
            return updated;
        });
        setHasUnsavedChanges(true);
        console.log(`Update ${String(field)}:`, value);
    };

    const handleSave = async () => {
        console.log("Saving product...", product);

        if (!product._id || !product.generation) {
            toast.error("Cannot save: Product ID or generation is missing");
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateBeybladeAction(product.generation, product._id, product);

            if (result.error) {
                toast.error(result.error);
            } else {
                setProduct(result.response);
                setHasUnsavedChanges(false);
                toast.success(result.message || "Product saved successfully");
                console.log("✓ Product saved:", result.response);
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Review Product</h1>
                    {hasUnsavedChanges && <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">⚠️ You have unsaved changes</p>}
                </div>
                <Button onClick={handleSave} className="gap-2" disabled={isSaving || !hasUnsavedChanges} variant={hasUnsavedChanges ? "default" : "secondary"}>
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={product.title} onChange={(e) => handleProductUpdate("title", e.target.value)} placeholder="Product title" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="productCode">Product Code</Label>
                            <Input id="productCode" value={product.productCode} onChange={(e) => handleProductUpdate("productCode", e.target.value)} placeholder="e.g., BX-01" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="releaseDate">Release Date</Label>
                            <Input id="releaseDate" type="date" value={product.releaseDate ? new Date(product.releaseDate).toISOString().split("T")[0] : ""} onChange={(e) => handleProductUpdate("releaseDate", e.target.value)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="asinEurope">ASIN Europe</Label>
                            <Input id="asinEurope" value={product.asinEurope ?? ""} onChange={(e) => handleProductUpdate("asinEurope", e.target.value)} placeholder="B0XXXXXXXXX" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="asinAmerica">ASIN America</Label>
                            <Input id="asinAmerica" value={product.asinAmerica ?? ""} onChange={(e) => handleProductUpdate("asinAmerica", e.target.value)} placeholder="B0XXXXXXXXX" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="asinJapan">ASIN Japan</Label>
                            <Input id="asinJapan" value={product.asinJapan ?? ""} onChange={(e) => handleProductUpdate("asinJapan", e.target.value)} placeholder="B0XXXXXXXXX" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
