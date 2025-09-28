import ClientProduct from "@/app/product/ClientProduct";
import { getProduct } from "@/components/shopify/serverActions";
import { boutiqueFromLocation, IShopify, TLocationHome } from "@/library/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import AddImage from "../../components/shopify/Product/AddImage";
import { variantController } from "@/library/models/produits/variantController";

export default async function Page({ searchParams }: { searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { id?: string; shopify?: TLocationHome };
    if (!query.id || !query.shopify)
        return (
            <div className="@container/main flex justify-center w-full">
                <p>No domain or product ID provided</p>
            </div>
        );
    const shopify = boutiqueFromLocation(query.shopify) as IShopify;
    const data = { productId: query.id, domain: shopify?.domain };
    const product = await getProduct(data);

    if (!product?.response) return <div>Erreur lors de la récupération du produit</div>;

    const sku = product.response.variants?.nodes[0]?.sku;
    const variant = await variantController.getVariantBySku(sku);

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <ClientProduct productData={product} shopify={shopify} variant={variant} />
            <AddImage />
        </div>
    );
}
