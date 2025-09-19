import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Switch } from "@/components/ui/switch";
import { useProduct } from "@/library/hooks/useProduct";
import { useState } from "react";
import { toast } from "sonner";
import { setAmazonActivateMetafield } from "../../serverActions";
import useShopifyStore from "../../shopifyStore";
import { IMetafieldRequest } from "../../typesShopify";

export default function Amazon() {
    const { product, shopifyBoutique } = useShopifyStore();
    const metafieldKey = "amazon_activate";
    const metafield = product?.metafields.nodes.find((mf) => mf.key === metafieldKey);
    if (!metafield) return null;
    const asin = product?.metafields.nodes.find((mf) => mf.key === "asin");
    if (!asin) return <p className="text-red-500">ASIN non défini, veuillez le renseigner pour activer l'affiliation Amazon.</p>;

    const [loading, setLoading] = useState(false);
    const { getProductUpdate } = useProduct();
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
            if (res?.message) {
                await getProductUpdate();
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <p className="flex items-center justify-space-between gap-4">
                Affiliation Amazon: <span className="font-semibold">{metafield.value === "true" ? "Activée" : "Désactivée"}</span>
                <Switch checked={metafield.value === "true"} onCheckedChange={(checked) => handleToggle()} disabled={loading} />
                <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
            </p>
            <a
                href={`https://${shopifyBoutique?.marketplaceAmazon}/dp/${metafield.value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
            >
                ASIN: {asin.value}
            </a>
        </>
    );
}
