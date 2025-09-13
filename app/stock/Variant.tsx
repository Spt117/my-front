import { toggleRebuy, toggleRebuyLater } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/produits/Variant";
import useVariantStore from "./store";
import { Switch } from "@/components/ui/switch";

export function Variant({ variant }: { variant: TVariant }) {
    const { setVariantsBuy, setVariantsBuyLater } = useVariantStore();

    const handleRebuyChange = async () => {
        const data = await toggleRebuy(variant.sku, !variant.rebuy);
        storeData(data);
    };
    const handleRebuyLaterChange = async () => {
        const data = await toggleRebuyLater(variant.sku, !variant.rebuyLater);
        storeData(data);
    };

    const storeData = async (data: TVariant[]) => {
        const variantsBuy = data.filter((variant) => variant.rebuy === true);
        const variantsBuyLater = data.filter((variant) => variant.rebuyLater === true);
        setVariantsBuy(variantsBuy);
        setVariantsBuyLater(variantsBuyLater);
    };

    return (
        <div className="border-b border-gray-300 p-4">
            <h2 className="text-lg font-semibold">{variant.title}</h2>
            <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
            <div className="flex items-center align-center rounded">
                <p className="text-sm text-gray-600 w-1/4">Rebuy:</p>
                <div>
                    <Switch checked={variant.rebuy} onCheckedChange={handleRebuyChange} className="mt-2" />
                </div>
            </div>
            <div className="flex items-center align-center rounded">
                <p className="text-sm text-gray-600 w-1/4">Rebuy Later:</p>
                <div>
                    <Switch checked={variant.rebuyLater} onCheckedChange={handleRebuyLaterChange} className="mt-2" />
                </div>
            </div>
        </div>
    );
}
