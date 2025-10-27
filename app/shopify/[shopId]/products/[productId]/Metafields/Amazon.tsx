"use client";
import { setAmazonActivateMetafield, setAsin } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { IMetafieldRequest } from "@/components/shopify/typesShopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Switch } from "@/components/ui/switch";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { toggleAffiliate } from "@/library/models/variantShopify/middlewareVariants";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Amazon() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [asinToAdd, setAsinToAdd] = useState("");
    const [loading, setLoading] = useState(false);
    const { getProductData } = useDataProduct();

    let activeAmazon = product?.metafields.nodes.find((mf) => mf.key === "amazon_activate");
    if (!activeAmazon) activeAmazon = { key: "amazon_activate", value: "false", namespace: "custom", type: "boolean" };

    const asin = product?.metafields.nodes.find((mf) => mf.key === "asin");

    if (!product || !shopifyBoutique || !product.variants) return;
    const sku = product.variants.nodes[0].sku;
    const activeValue = activeAmazon?.value === "true" ? false : true;

    const handleToggle = async () => {
        setLoading(true);
        const data: IMetafieldRequest = {
            productId: product.id,
            domain: shopifyBoutique.domain,
            key: activeAmazon?.key,
            value: activeValue,
        };
        try {
            toggleAffiliate(shopifyBoutique.domain, sku, activeValue);
            const res = await setAmazonActivateMetafield(data);
            if (res?.error) toast.error(res.error);
            if (res?.message) {
                await getProductData();
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (asin) setAsinToAdd("");
    }, [asin]);

    const handleAddAsin = async () => {
        if (!asinToAdd.trim()) {
            toast.error("L'ASIN ne peut pas être vide.");
            return;
        }
        setLoading(true);
        const data: IMetafieldRequest = {
            productId: product.id,
            domain: shopifyBoutique.domain,
            key: "asin",
            value: asinToAdd,
        };
        try {
            const res = await setAsin(data);
            if (res?.error) toast.error(res.error);
            if (res?.message) {
                await getProductData();
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2 flex-col">
            <div>
                <p className="flex items-center justify-space-between gap-4">
                    Affiliation Amazon:{" "}
                    <span className="font-semibold">{activeAmazon.value === "true" ? "Activée" : "Désactivée"}</span>
                    <Switch checked={activeAmazon.value === "true"} onCheckedChange={() => handleToggle()} disabled={loading} />
                    <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                </p>
                {asin && (
                    <a
                        href={`https://${shopifyBoutique?.marketplaceAmazon}/dp/${asin.value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        ASIN: {asin.value}
                    </a>
                )}
            </div>
            <div className="flex gap-2">
                <Input type="text" placeholder="Ajouter  ASIN" onChange={(e) => setAsinToAdd(e.target.value)} value={asinToAdd} />
                <Button disabled={!asinToAdd.trim() || loading} onClick={handleAddAsin}>
                    Ajouter ASIN
                    <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                </Button>
            </div>
        </div>
    );
}
