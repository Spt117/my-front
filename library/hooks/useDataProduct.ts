import { fetchVariant, getTasks } from "@/app/shopify/[shopId]/products/[productId]/serverAction";
import useProductStore from "@/app/shopify/[shopId]/products/[productId]/storeProduct";
import useTaskStore from "@/app/shopify/[shopId]/products/[productId]/Tasks/storeTasks";
import { getProduct } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export const useDataProduct = () => {
    const { shopifyBoutique, setProduct, setVariant, product } = useShopifyStore();
    const { setLoading } = useProductStore();
    const params = useParams();
    const productId = params.productId as string;
    const { setTasks } = useTaskStore();

    const getProductData = async () => {
        if (!shopifyBoutique) return;
        setLoading(true);
        try {
            const dataParam = { productId: productId, domain: shopifyBoutique.domain };
            const data = await getProduct(dataParam);
            if (data) setProduct(data.response);
            if (data?.error) toast.error(data.error);
        } catch (error) {
            console.error("Error fetching boutique data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        const tasksData = await getTasks(productId);
        setTasks(tasksData);
    };

    const fetchVariantData = async () => {
        if (!shopifyBoutique || !product) return;
        const variantData = await fetchVariant(product, shopifyBoutique.domain);
        setVariant(variantData);
    };

    return {
        getProductData,
        fetchTasks,
        fetchVariantData,
    };
};
