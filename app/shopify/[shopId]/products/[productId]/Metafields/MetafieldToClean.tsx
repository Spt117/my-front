import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteMetafield } from "../serverAction";
import { cssCard } from "../util";

export default function MetafieldToClean() {
    const [loading, setLoading] = useState(false);
    const { product, shopifyBoutique } = useShopifyStore();
    const { getProductData } = useDataProduct();
    const metafields = product?.metafields.nodes.filter((mf) => mf.namespace === "custom");

    if (!product || !shopifyBoutique) return null;

    const handleDelete = async (key: string) => {
        setLoading(true);
        const domain = shopifyBoutique.domain;
        if (!key) return;
        try {
            const res = await deleteMetafield(domain, product.id, key);
            if (res?.error) toast.error(res.error);
            if (res?.message) toast.success(res.message);
            await getProductData();
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`${cssCard} overflow-hidden relative`}>
            <CardHeader>
                {metafields?.map((m) => (
                    <div key={m.key} className="flex justify-between items-center gap-2">
                        <p className="text-xs ">
                            {m.key}: {m.value}
                        </p>
                        <Trash2 className="cursor-pointer" size={20} onClick={() => handleDelete(m.key)} />
                        <Spinner className={`absolute top-2 right-2 ${loading ? "visible" : "invisible"}`} size={16} />
                    </div>
                ))}
            </CardHeader>
        </Card>
    );
}
