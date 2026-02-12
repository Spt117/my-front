import ResultSearch from "@/app/shopify/[shopId]/products/ResultSearch";
import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { boutiqueFromId } from "@/params/paramsShopify";


export default async function Page({ params }: { params: Promise<{ shopId: string }> }) {
    const { shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));

    const [productsResponse, countResponse] = await Promise.all([
        getServer(`${pokeUriServer}/shopify/50-products?domain=${boutique?.domain}`),
        getServer(`${pokeUriServer}/shopify/product-count?domain=${boutique?.domain}`),
    ]);

    const productsSearch = productsResponse?.response?.products || [];
    const error = productsResponse?.error || null;
    const totalProducts = countResponse?.response ?? null;

    return (
        <div className="p-4 flex flex-col items-center justify-center">
            <ResultSearch products={productsSearch} error={error} totalProducts={totalProducts} boutiqueName={boutique.vendor} />
        </div>
    );
}
