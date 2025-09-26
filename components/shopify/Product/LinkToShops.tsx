import { TVariant } from "@/library/models/produits/Variant";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";

export default function LinkToShops({ variant }: { variant: TVariant }) {
    const shopifyUrls = variant.ids.map((d) => {
        const boutique = boutiqueFromDomain(d.shop);
        const data = {
            urlShopify: `https://${d.shop}/admin/products/${d.idProduct?.replace("gid://shopify/Product/", "")}`,
            nameShop: boutique.vendor,
            flag: boutique.flag,
        };
        return data;
    });

    return (
        <div className="flex flex-col gap-2">
            {shopifyUrls.map((d) => (
                <a
                    key={d.nameShop}
                    href={d.urlShopify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center space-x-1"
                >
                    <img src={d.flag} alt={d.nameShop} className="w-5 h-5 rounded-full" />
                    <span className="text-sm">{d.nameShop}</span>
                </a>
            ))}
        </div>
    );
}
