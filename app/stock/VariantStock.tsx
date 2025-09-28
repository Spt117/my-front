import LinkToShops from "@/components/shopify/Product/LinkToShops";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleRebuy, toggleRebuyLater } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import useVariantStore from "./store";
import UpdateStock from "./UpdateStock";
import { usePathname } from "next/navigation";

export function VariantStock({ variant, action }: { variant: TVariant; action: () => void }) {
    const { setVariantsBuy, setVariantsBuyLater } = useVariantStore();
    const { shopifyBoutique } = useShopifyStore();
    const path = usePathname();
    if (!shopifyBoutique) return null;

    const handleRebuyChange = async (bool: boolean) => {
        const data = await toggleRebuy(variant.sku, bool);
        action();
    };
    const handleRebuyLaterChange = async (bool: boolean) => {
        const data = await toggleRebuyLater(variant.sku, bool);
        action();
    };

    const storeData = async (data: TVariant[]) => {
        const variantsBuy = data.filter((variant) => variant.rebuy === true);
        const variantsBuyLater = data.filter((variant) => variant.rebuyLater === true);
        setVariantsBuy(variantsBuy);
        setVariantsBuyLater(variantsBuyLater);
    };

    const id = variant.ids.find((p) => p.shop === shopifyBoutique.domain);
    const urlProduct = `/product?id=${id?.idProduct.replace("gid://shopify/Product/", "")}&shopify=${shopifyBoutique.locationHome}`;

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white w-min h-min">
            <CardContent className="space-y-6">
                {path === "/stock" && (
                    <h2 className="text-lg font-semibold">
                        <a href={urlProduct} rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {variant.title}
                        </a>
                    </h2>
                )}

                <div className="space-y-1">
                    {path === "/stock" && (
                        <>
                            <p className="text-sm text-gray-600">Prix: {variant.price} €</p>
                            <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                        </>
                    )}
                    <div className="flex items-center align-center rounded">
                        <p className="text-sm text-gray-600 w-50">Rebuy:</p>
                        <div>
                            <Switch checked={variant.rebuy} onCheckedChange={() => handleRebuyChange(!variant.rebuy)} />
                        </div>
                    </div>
                    <div className="flex items-center align-center rounded">
                        <p className="text-sm text-gray-600 w-50">Rebuy Later:</p>
                        <div>
                            <Switch checked={variant.rebuyLater} onCheckedChange={() => handleRebuyLaterChange(!variant.rebuyLater)} />
                        </div>
                    </div>
                </div>
                <UpdateStock params={{ sku: variant.sku, quantity: variant.quantity, domain: shopifyBoutique.domain }} action={storeData} />
            </CardContent>
        </Card>
    );
}
