"use client";
import ProductList from "@/components/header/products/Products";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { FileEdit, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DraftProducts({ products }: { products: any[] }) {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FileEdit className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Produits en brouillon ({products.length})</h2>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Actualiser
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit en brouillon</p>
                    <p className="text-sm">Tous les produits sont publiés !</p>
                </div>
            ) : (
                <>
                    {products.map((product, index) => (
                        <ProductList product={product} key={index} />
                    ))}
                    <Separator />
                </>
            )}
        </div>
    );
}
