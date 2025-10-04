import useShopifyStore from "@/components/shopify/shopifyStore";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import useProductStore from "./storeProduct";
import { useEffect } from "react";

export default function HeaderEditeur() {
    const { product } = useShopifyStore();
    const { newTitle, setNewTitle } = useProductStore();

    const title = product ? product.title : "";

    useEffect(() => {
        setNewTitle(title);
    }, [title, setNewTitle, product]);

    return (
        <CardHeader className="p-0">
            <Label htmlFor="title" className="text-lg font-medium">
                Titre
            </Label>
            <Input
                id="title"
                placeholder="Titre"
                className="w-full border-slate-400"
                aria-label="Titre"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
            />
            <h6 className="mt-5 mb-2 text-lg font-medium">Description</h6>
        </CardHeader>
    );
}
