"use client";

import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useBeybladeStore from "./beybladeStore";
import ImageManager from "./ImageManager";
import { createProductBeyblade } from "./model/product/middlewareProduct";
import { IBeybladeProduct } from "./model/typesBeyblade";
import AddContentItem from "./productInformation/AddContentItem";
import ProductData from "./productInformation/ProductData";

export default function BeybladeProductForm() {
    const { beybladeProduct, resetBeybladeProduct, initializeNewProduct, generation, addContentItem, addImage, removeImage } =
        useBeybladeStore();

    const [currentTab, setCurrentTab] = useState("basic");

    // Initialiser le produit si null
    useState(() => {
        if (!beybladeProduct) {
            initializeNewProduct();
        }
    });

    const handleSubmit = async () => {
        console.log("Product to save:", beybladeProduct);

        if (beybladeProduct?.productCode && beybladeProduct?.releaseDate && beybladeProduct.brand && beybladeProduct.product) {
            // Assure TypeScript que product est bien défini
            const res = await createProductBeyblade(beybladeProduct as IBeybladeProduct, generation);
            console.log("Product created:", res);
            if (res.message) toast.success(res.message);
            if (res.error) toast.error(res.error);
        } else {
            const msg = `Product creation failed: ${beybladeProduct?.productCode ? "" : "Product code is missing."} ${
                beybladeProduct?.releaseDate ? "" : "Release date is missing."
            } ${beybladeProduct?.brand ? "" : "Brand is missing."} ${beybladeProduct?.product ? "" : "Product name is missing."}`;
            toast.error(msg);
        }
    };
    if (!beybladeProduct) return null;

    return (
        <div className="container mx-auto p-3 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Create Beyblade Product</h1>
                    <p className="text-muted-foreground mt-2">Add a new product to your collection</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={resetBeybladeProduct}>
                        Reset
                    </Button>
                    <Button onClick={handleSubmit} className="gap-2">
                        <Package className="w-4 h-4" />
                        Save Product
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <ProductData />
                <AddContentItem />
                <ImageManager
                    images={beybladeProduct?.images || []}
                    onAddImage={addImage}
                    onRemoveImage={removeImage}
                    title="Product Images"
                    description="Add images of the product"
                    emptyMessage="No product images added yet"
                />
            </div>
        </div>
    );
}
