import { getProduct } from "@/components/shopify/serverActions";
import { LayoutPropsShopify } from "@/components/shopify/utils";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { boutiqueFromId } from "@/params/paramsShopify";
import ProductLayoutClient from "./ProductLayoutClient";
import { getTasks } from "./serverAction";

export default async function ProductLayout({ children, params }: LayoutPropsShopify) {
    const { productId, shopId } = await params;
    const boutique = boutiqueFromId(Number(shopId));

    // ✅ Chargement parallèle côté serveur
    let product = null;
    let tasks: TTaskShopifyProducts[] = [];
    let error = null;

    if (boutique) {
        try {
            const [productData, tasksData] = await Promise.all([
                getProduct({ productId, domain: boutique.domain }),
                getTasks(productId),
            ]);

            product = productData?.response || null;
            tasks = tasksData || [];
            error = productData?.error || null;
        } catch (err) {
            console.error("Error fetching product data:", err);
            error = "Failed to load product data";
        }
    }

    return (
        <ProductLayoutClient product={product} tasks={tasks} boutique={boutique} productId={productId} error={error}>
            {children}
        </ProductLayoutClient>
    );
}
