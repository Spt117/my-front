"use client";
import { getProduct } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { postServer } from "@/library/utils/fetchServer";
import { useState } from "react";

export default function AddImage() {
    const { product, shopifyBoutique, setProduct } = useShopifyStore();
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({
        url: "",
        name: "",
        altText: "",
    });

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
    const click = () => {
        console.log(params);
    };
    return (
        <div onClick={click} className="mx-4 my-8 p-4 border rounded-lg flex flex-col items-center">
            <h3 className="mb-4 text-lg font-semibold">Ajouter une image à {product?.title || "No product selected"}</h3>
            <Input
                onChange={(e) => {
                    setParams({ ...params, url: e.target.value });
                }}
                placeholder="Url"
            />
            <br />
            <Input
                onChange={(e) => {
                    setParams({ ...params, name: e.target.value });
                }}
                placeholder="name"
            />
            <br />
            <Input
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
