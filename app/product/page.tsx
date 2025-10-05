import { getCanauxPublication, getProduct } from "@/components/shopify/serverActions";
import { TVariant } from "@/library/models/produits/Variant";
import { variantController } from "@/library/models/produits/variantController";
import { TaskShopifyController } from "@/library/models/tasksShopify/taskController";
import { boutiqueFromLocation, IShopify, TLocationHome } from "@/library/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import { postServer } from "@/library/utils/fetchServer";
import { sendToTelegram } from "@/library/utils/telegram";
import { pokeUriServer, telegram } from "@/library/utils/uri";
import ProductClient from "./ProductClient";
import ProductContent from "./ProductContent";

export default async function Page({ searchParams }: { searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { id?: string; shopify?: TLocationHome };

    if (!query.id || !query.shopify) return null;

    const shopify = boutiqueFromLocation(query.shopify) as IShopify;
    const data = { productId: query.id, domain: shopify.domain };
    const product = await getProduct(data);

    const canauxPublication = await getCanauxPublication(shopify.domain);

    if (product?.error || !product?.response) {
        return (
            <div className="p-4 flex flex-col items-center justify-center">
                <h2>Erreur lors de la récupération du produit</h2>
                <p>{product?.error}</p>
            </div>
        );
    }

    const sku = product.response.variants.nodes[0].sku;
    let variant = null;

    if (sku) variant = await variantController.getVariantBySku(sku);
    if (!variant && sku) {
        sendToTelegram(`Variant with SKU: ${sku} not found in local database. Creating...`, telegram.rapports);
        const url = `${pokeUriServer}/shopify/create-variant`;
        const variantProduct = product.response.variants.nodes[0];
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
            ids: [
                {
                    shop: shopify.domain,
                    idVariant: variantProduct.id,
                    idProduct: product.response.id,
                },
            ],
        };
        const response = await postServer(url, { variant: variantData, domain: shopify.domain });
        if (response.error)
            return (
                <div className="p-4 flex flex-col items-center justify-center">
                    <h2>Erreur lors de la récupération de la variante {sku}</h2>
                    <p>{response.error}</p>
                </div>
            );
        else variant = response.response;
    }

    const tasks = await TaskShopifyController.getTaskBySkuAndStockActivation(sku);

    return (
        <>
            <ProductClient
                canaux={canauxPublication}
                productData={product}
                shopify={shopify}
                variantData={variant}
                tasksData={tasks}
            />
            <ProductContent />
        </>
    );
}
