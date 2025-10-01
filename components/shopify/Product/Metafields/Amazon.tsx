"use client";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { setAmazonActivateMetafield, setAsin } from "../../serverActions";
import useShopifyStore from "../../shopifyStore";
import { IMetafieldRequest } from "../../typesShopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Amazon() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [asinToAdd, setAsinToAdd] = useState("");
    const [loading, setLoading] = useState(false);
    const metafieldKey = "amazon_activate";
    const metafield = product?.metafields.nodes.find((mf) => mf.key === metafieldKey);
    if (!metafield) return null;
    const asin = product?.metafields.nodes.find((mf) => mf.key === "asin");

    if (!product || !shopifyBoutique) return;
    const handleToggle = async () => {
        setLoading(true);
        const data: IMetafieldRequest = {
            productId: product.id,
            domain: shopifyBoutique.domain,
            key: metafield.key,
            value: metafield.value === "true" ? false : true,
        };
        try {
            const res = await setAmazonActivateMetafield(data);
            if (res?.error) toast.error(res.error);
            if (res?.message) toast.success(res.message);
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    if (asin)
        return (
            <>
                <p className="flex items-center justify-space-between gap-4">
                    Affiliation Amazon: <span className="font-semibold">{metafield.value === "true" ? "Activée" : "Désactivée"}</span>
                    <Switch checked={metafield.value === "true"} onCheckedChange={() => handleToggle()} disabled={loading} />
                    <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                </p>
                <a href={`https://${shopifyBoutique?.marketplaceAmazon}/dp/${asin.value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    ASIN: {asin.value}
                </a>
            </>
        );
    else {
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
                if (res?.message) toast.success(res.message);
            } catch (error) {
                toast.error("An error occurred while updating the metafield.");
            } finally {
                setLoading(false);
            }
        };
        return (
            <div className="flex gap-2">
                <Input type="text" placeholder="Ajouter  ASIN" onChange={(e) => setAsinToAdd(e.target.value)} value={asinToAdd} />
                <Button disabled={!asinToAdd.trim() || loading} onClick={handleAddAsin}>
                    Ajouter ASIN
                    <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                </Button>
            </div>
        );
    }
}
