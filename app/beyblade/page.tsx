"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "lucide-react";
import { useState } from "react";
import useBeybladeStore from "./beybladeStore";
import Content from "./Content/Content";
import ImageManager from "./ImageManager";
import Preview from "./Preview";
import ProductData from "./productInformation/ProductData";

export default function BeybladeProductForm() {
    const { beybladeProduct, resetBeybladeProduct, initializeNewProduct, addImage, removeImage } = useBeybladeStore();

    const [currentTab, setCurrentTab] = useState("basic");

    // Initialiser le produit si null
    useState(() => {
        if (!beybladeProduct) {
            initializeNewProduct();
        }
    });

    const handleSubmit = () => {
        console.log("Product to save:", beybladeProduct);
        // Ici tu peux appeler ton API pour sauvegarder
    };

    if (!beybladeProduct) return null;

    return (
        <div className="container mx-auto py-8 max-w-6xl">
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

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Product</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <ProductData />

                <Content />

                <Preview />
            </Tabs>
        </div>
    );
}
