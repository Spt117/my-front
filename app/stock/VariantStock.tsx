import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleBought, toggleRebuy, toggleRebuyLater } from "@/library/models/produits/middlewareVariants";
import { TVariant } from "@/library/models/variantShopify/Variant";
import { boutiqueFromDomain, TDomainsShopify } from "@/params/paramsShopify";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cssCard } from "../product/util";
import UpdateStock from "./UpdateStock";

export function VariantStock({ domain, variant, action }: { domain: TDomainsShopify; variant: TVariant; action: () => void }) {
    const path = usePathname();

    const handleRebuyChange = async () => {
        const data = await toggleRebuy(domain, variant.sku, !variant.rebuy);
        if (data) action();
    };
    const handleRebuyLaterChange = async () => {
        const data = await toggleRebuyLater(domain, variant.sku, !variant.rebuyLater);
        if (data) action();
    };

    const handleBoughtChange = async () => {
        const data = await toggleBought(domain, variant, !variant.bought);
        if (data) action();
    };

    const shopifyBoutique = boutiqueFromDomain(domain);
    const urlProduct = `/product?id=${variant.idProduct.replace("gid://shopify/Product/", "")}&shopify=${shopifyBoutique?.locationHome}`;

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-6">
                {path === "/stock" && (
                    <h2 className="text-lg font-semibold">
                        <Link href={urlProduct} rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {variant.title}
                        </Link>
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
                            <Switch checked={variant.rebuy} onCheckedChange={handleRebuyChange} />
                        </div>
                    </div>
                    <div className="flex items-center align-center rounded">
                        <p className="text-sm text-gray-600 w-50">Rebuy Later:</p>
                        <div>
                            <Switch checked={variant.rebuyLater} onCheckedChange={handleRebuyLaterChange} />
                        </div>
                    </div>
                    <div className="flex items-center align-center rounded">
                        <p className="text-sm text-gray-600 w-50">Bought:</p>
                        <div>
                            <Switch checked={variant.bought} onCheckedChange={handleBoughtChange} />
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200" /> {/* Ligne de séparation */}
                <UpdateStock params={{ sku: variant.sku, quantity: variant.quantity, domain: domain }} />
            </CardContent>
        </Card>
    );
}
