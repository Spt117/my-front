import ResultSearch from "@/app/shopify/[shopId]/products/ResultSearch";
import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import { boutiqueFromId } from "@/params/paramsShopify";


export default async function Page({ params }: { params: Promise<{ shopId: string }> }) {
    const { shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));
    const url = `${pokeUriServer}/shopify/50-products?domain=${boutique?.domain}`;
    const response = await getServer(url);
    const productsSearch = response.response.products;

    return (
        <div className="p-4 flex flex-col items-center justify-center">
            <ResultSearch products={productsSearch} />
        </div>
    );
}
