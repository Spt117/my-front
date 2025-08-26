"use client";
import { getProduct } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { postServer } from "@/library/utils/fetchServer";
import { X } from "lucide-react";
import { useState } from "react";

export default function AddImage() {
    const { product, shopifyBoutique, setProduct } = useShopifyStore();
    const [loading, setLoading] = useState(false);
    const initialParams = {
        url: "",
        name: "",
        altText: "",
    };
    const [params, setParams] = useState(initialParams);

    const handleAddImage = async () => {
        if (!shopifyBoutique || !product || !params.url || !params.name) return;
        setLoading(true);
        // Logic to add image to the product using Shopify API
        const data = {
            domain: shopifyBoutique.domain,
            productId: product.id,
            image: params,
        };

        await postServer("http://localhost:9100/shopify/add-image", data);

        const paramsProduct = {
            domain: shopifyBoutique.domain,
            productId: product.id,
        };
        const updatedProduct = await getProduct(paramsProduct);
        setLoading(false);
        setProduct(updatedProduct);
    };

    return (
        <div className="mx-4 my-8 p-4 border rounded-lg flex flex-col items-center relative">
            <h3 className="mb-4 text-lg font-semibold">Ajouter une image à {product?.title || "No product selected"}</h3>
            {(params.url || params.altText || params.name) && (
                <button type="button" onClick={() => setParams(initialParams)} className="absolute right-3 top-5 cursor-pointer transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Effacer la recherche">
                    <X size={30} />
                </button>
            )}
            <Input
                value={params.url}
                onChange={(e) => {
                    setParams({ ...params, url: e.target.value });
                }}
                placeholder="Url"
            />
            <br />
            <Input
                value={params.name}
                onChange={(e) => {
                    setParams({ ...params, name: e.target.value });
                }}
                placeholder="name"
            />
            <br />
            <Input
                value={params.altText}
                onChange={(e) => {
                    setParams({ ...params, altText: e.target.value });
                }}
                placeholder="alt"
            />
            <br />
            {!loading && (
                <Button className="ml-2" onClick={handleAddImage} disabled={!params.url || !params.name || !product}>
                    Add Image
                </Button>
            )}
            {loading && <Spinner />}
        </div>
    );
}
