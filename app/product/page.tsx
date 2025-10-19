import { getProduct } from "@/components/shopify/serverActions";
import { TaskShopifyController } from "@/library/models/tasksShopify/taskController";
import { TVariant } from "@/library/models/variantShopify/Variant";
import { variantController } from "@/library/models/variantShopify/variantController";
import { boutiqueFromLocation, IShopify, TLocationHome } from "@/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import ProductClient from "./ProductClient";
import ProductContent from "./ProductContent";
import ResultSearch from "./ResultSearch";
import { pokeUriServer } from "@/library/utils/uri";
import { getServer } from "@/library/utils/fetchServer";

export default async function Page({ searchParams }: { searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { id?: string; shopify?: TLocationHome };

    if (!query.id || !query.shopify) return <ResultSearch />;

    const shopify = boutiqueFromLocation(query.shopify) as IShopify;
    const data = { productId: query.id, domain: shopify.domain };
    const product = await getProduct(data);

    if (product?.error || !product?.response) {
        console.log("error");
        console.error(product?.error);

        return (
            <div className="p-4 flex flex-col items-center justify-center">
                <h2>Erreur lors de la récupération du produit</h2>
                <p>{product?.error}</p>
            </div>
        );
    }

    const sku = product.response.variants?.nodes[0].sku;
    let variant = null;

    if (sku) variant = await variantController(shopify.domain).getVariantBySku(sku);
    if (!variant && sku && product.response.variants) {
        const urlOtherShop = `${pokeUriServer}/shopify/create-variant?domain=${shopify.domain}&sku=${encodeURIComponent(sku)}`;
        getServer(urlOtherShop);
        const variantProduct = product.response.variants.nodes[0];
        let activeAmazon = product?.response.metafields.nodes.find((mf) => mf.key === "amazon_activate");
        const variantData: TVariant = {
            title: product.response.title,
            sku: variantProduct.sku,
            price: Number(variantProduct.price),
            compareAtPrice: Number(variantProduct.compareAtPrice),
            barcode: variantProduct.barcode || undefined,
            quantity: variantProduct.inventoryQuantity || 0,
            rebuy: false,
            rebuyLater: false,
            bought: false,
            idVariant: variantProduct.id,
            idProduct: product.response.id,
            activeAffiliate: activeAmazon?.value === "true" ? true : false,
        };
        const response = await variantController(shopify.domain).createVariant(variantData);
        if (!response)
            return (
                <div className="p-4 flex flex-col items-center justify-center">
                    <h2>Erreur lors de la récupération de la variante {sku}</h2>
                </div>
            );
        else variant = response;
    }

    const tasks = sku ? await TaskShopifyController.getTaskBySkuAndStockActivation(sku) : [];

    return (
        <>
            <ProductClient productData={product} shopify={shopify} variantData={JSON.parse(JSON.stringify(variant))} tasksData={tasks} />
            <ProductContent />
        </>
    );
}
