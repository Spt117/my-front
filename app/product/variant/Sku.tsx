import CopyComponent from "@/components/Copy";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { KeySquare, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateVariant } from "../serverAction";
import useVariantStore from "../storeVariant";
import { cssCard } from "../util";

export default function Sku() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { sku, setSku } = useVariantStore();
    const [loading, setLoading] = useState(false);
    const variant = product?.variants?.nodes[0];

    useEffect(() => {
        if (variant && variant.sku) setSku(variant.sku);
    }, [variant, setSku]);

    if (!product || !variant || !shopifyBoutique) return null;

    const activeSave = sku !== variant.sku && !loading;

    const handleSave = async () => {
        if (!activeSave) return;
        setLoading(true);
        try {
            const res = await updateVariant(shopifyBoutique.domain, product.id, variant.id, "sku", sku);
            if (res?.error) toast.error(res.error);
            if (res?.message) toast.success(res.message);
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cssCard + " relative"}>
            <CardContent className="flex flex-col justify-between gap-2 ">
                {activeSave && !loading && <Save onClick={handleSave} className="absolute right-2 top-1 cursor-pointer" size={20} />} {loading && <Spinner className="absolute right-2 top-1" size={20} />}
                <h3 className="m-2 text-sm font-medium flex items-center gap-2">
                    <KeySquare size={16} />
                    Sku<span className="text-gray-500">(unité de gestion des stocks)</span>
                </h3>
                <div className="relative">
                    <Input type="text" value={sku} className="w-full" onChange={(e) => setSku(e.target.value)} />
                    <CopyComponent contentToCopy={sku} className="absolute right-2 top-2" message="SKU copié !" size={20} />
                </div>
            </CardContent>
        </Card>
    );
}
