import { getStockVariant, toggleRebuy, toggleRebuyLater } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import useVariantStore from "./store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { postServer } from "@/library/utils/fetchServer";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Card } from "@/components/ui/card";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { sleep } from "@/library/utils/helpers";

export function Variant({ variant }: { variant: TVariant }) {
    const { setVariantsBuy, setVariantsBuyLater } = useVariantStore();
    const [numberInput, setNumberInput] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const domain = variant.ids.find((id) => id.shop === "bayblade-shops.myshopify.com")?.shop;
    if (!domain) return null;
    const boutique = boutiqueFromDomain(domain);

    const handleRebuyChange = async (bool: boolean) => {
        const data = await toggleRebuy(variant.sku, bool);
        storeData(data);
    };
    const handleRebuyLaterChange = async (bool: boolean) => {
        const data = await toggleRebuyLater(variant.sku, bool);
        storeData(data);
    };

    const storeData = async (data: TVariant[]) => {
        const variantsBuy = data.filter((variant) => variant.rebuy === true);
        const variantsBuyLater = data.filter((variant) => variant.rebuyLater === true);
        setVariantsBuy(variantsBuy);
        setVariantsBuyLater(variantsBuyLater);
    };

    const ids = variant.ids;
    const id = ids.find((id) => id.shop === domain)?.idProduct;
    const url = `https://${domain}/admin/products/${id?.replace("gid://shopify/Product/", "")}`;
    const urlProduct = `/product?id=${id?.replace("gid://shopify/Product/", "")}&shopify=${boutique.locationHome}`;

    const handleUpdateVariantStock = async () => {
        if (!variant.quantity) {
            toast.error("Quantité actuelle invalide");
            return;
        }
        setIsLoading(true);
        const url = `http://localhost:9100/shopify/update-stock`;

        const data = {
            domain: domain,
            sku: variant.sku,
            quantity: numberInput + variant.quantity,
        };
        const res = await postServer(url, data);
        const vUpdated = await getStockVariant();
        if (res.error) toast.error("Erreur lors de la mise à jour du stock");
        if (res.message) {
            toast.success(res.message);
            await sleep(500);
            if (variant.rebuy) await handleRebuyChange(false);
            if (variant.rebuyLater) await handleRebuyLaterChange(false);
        }
        storeData(vUpdated);
        setIsLoading(false);
        setNumberInput(0);
    };

    return (
        <Card className="p-4 mb-4">
            <h2 className="text-lg font-semibold">
                <a href={urlProduct} rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {variant.title}
                </a>
            </h2>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
            </a>
            <p className="text-sm text-gray-600">
                Quantité en stock: {variant.quantity}
                {numberInput && variant.quantity && (
                    <span className="font-bold">
                        {"  -> "}
                        {numberInput + variant.quantity}
                    </span>
                )}{" "}
            </p>
            <div>
                <div className="flex items-center align-center rounded">
                    <p className="text-sm text-gray-600 w-50">Rebuy:</p>
                    <div>
                        <Switch
                            checked={variant.rebuy}
                            onCheckedChange={() => handleRebuyChange(!variant.rebuy)}
                            className="mt-2"
                        />
                    </div>
                </div>
                <div className="flex items-center align-center rounded">
                    <p className="text-sm text-gray-600 w-50">Rebuy Later:</p>
                    <div>
                        <Switch
                            checked={variant.rebuyLater}
                            onCheckedChange={() => handleRebuyLaterChange(!variant.rebuyLater)}
                            className="mt-2"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex space-x-2">
                <Input
                    value={numberInput}
                    placeholder="Quantité"
                    type="number"
                    className="w-min"
                    onChange={(e) => {
                        setNumberInput(Number(e.target.value));
                    }}
                />
                {!isLoading && <Button onClick={handleUpdateVariantStock}>Ajouter</Button>}
                {isLoading && <Spinner className="h-6 w-6" />}{" "}
            </div>
        </Card>
    );
}
