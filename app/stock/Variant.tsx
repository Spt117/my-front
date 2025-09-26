import LinkToShops from "@/components/shopify/Product/LinkToShops";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleRebuy, toggleRebuyLater } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import useVariantStore from "./store";
import UpdateStock from "./UpdateStock";

export function Variant({ variant }: { variant: TVariant }) {
    const { setVariantsBuy, setVariantsBuyLater } = useVariantStore();

    const domainData = variant.ids[0];
    const boutique = boutiqueFromDomain(domainData.shop);

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

    const url = `https://${domainData.shop}/admin/products/${domainData.idProduct?.replace("gid://shopify/Product/", "")}`;
    const urlProduct = `/product?id=${domainData.idProduct?.replace("gid://shopify/Product/", "")}&shopify=${
        boutique.locationHome
    }`;

    return (
        <Card className="p-4 mb-4 flex">
            <h2 className="text-lg font-semibold">
                <a href={urlProduct} rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {variant.title}
                </a>
            </h2>

            <LinkToShops variant={variant} />

            <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Prix: {variant.price} €</p>
                <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
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
            <UpdateStock
                params={{ sku: variant.sku, quantity: variant.quantity || 0, domain: domainData.shop }}
                action={storeData}
            />
        </Card>
    );
}
