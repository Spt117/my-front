import { getProduct } from "@/components/shopify/serverActions";
import { variantController } from "@/library/models/produits/variantController";
import { boutiqueFromLocation, IShopify, TLocationHome } from "@/library/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import { pokeUriServer, telegram } from "@/library/utils/uri";
import ProductClient from "./ProductClient";
import ProductContent from "./ProductContent";
import { TVariant } from "@/library/models/produits/Variant";
import { postServer } from "@/library/utils/fetchServer";
import { sendToTelegram } from "@/library/utils/telegram";

export default async function Page({ searchParams }: { searchParams: Promise<SegmentParams> }) {
    const query = (await searchParams) as { id?: string; shopify?: TLocationHome };

    if (!query.id || !query.shopify) return null;

    const shopify = boutiqueFromLocation(query.shopify) as IShopify;
    const data = { productId: query.id, domain: shopify.domain };
    const product = await getProduct(data);

    if (!product?.response) return <div>Erreur lors de la récupération du produit</div>;

    const sku = product.response.variants.nodes[0].sku;
    let variant = await variantController.getVariantBySku(sku);

    if (!variant) {
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
        if (response.error) return <h2>Erreur lors de la récupération de la variante {sku}</h2>;
        else variant = response.response;
    }

    if (!variant) return <h2>Variante introuvable</h2>;
    return (
        <>
            <ProductClient productData={product} shopify={shopify} variantData={variant} />
            <ProductContent variantData={variant} />
        </>
    );
}
