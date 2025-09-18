import { Switch } from "@/components/ui/switch";
import { useProduct } from "@/library/hooks/useProduct";
import { TMetafield } from "@/library/types/graph";
import { useState } from "react";
import useShopifyStore from "../../shopifyStore";
import { IMetafieldRequest } from "../../typesShopify";
import { setAmazonActivateMetafield } from "../../serverActions";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function Amazon({ metafield }: { metafield: TMetafield }) {
    const { product, shopifyBoutique } = useShopifyStore();
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
        <li className="flex items-center justify-space-between gap-4">
            Affiliation Amazon: <span className="font-semibold">{metafield.value === "true" ? "Activée" : "Désactivée"}</span>
            <Switch checked={metafield.value === "true"} onCheckedChange={(checked) => handleToggle()} disabled={loading} />
            <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
        </li>
    );
}
