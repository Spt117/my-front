// import { getProduct } from "@/components/shopify/serverActions";
// import useShopifyStore from "@/components/shopify/shopifyStore";
// import { IGetProduct } from "@/components/shopify/typesShopify";
// import { toast } from "sonner";
// import { sleep } from "../utils/helpers";

// export const useProduct = () => {
//     const { product, shopifyBoutique, setProduct } = useShopifyStore();

//     const getProductUpdate = async () => {
//         if (!shopifyBoutique || !product) {
//             const msg = !shopifyBoutique ? "No boutique selected" : "No product selected";
//             toast.error(msg);
//             return;
//         }
//         try {
//             const params: IGetProduct = {
//                 productId: product.id,
//                 domain: shopifyBoutique.domain,
//             };
//             // await sleep(1500);
//             const data = await getProduct(params);
//             if (data?.error) toast.error(data.error);
//             if (data?.response) setProduct(data.response);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     return {
//         getProductUpdate,
//     };
// };
