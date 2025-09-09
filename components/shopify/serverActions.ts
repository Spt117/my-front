// "use server";

// import { ProductGET } from "@/library/types/graph";
// import { IGetProduct } from "@/library/types/shopifySearch";
// import { postServer } from "@/library/utils/fetchServer";

// export async function getProduct(data: IGetProduct): Promise<ProductGET | null> {
//     const url = "http://localhost:9100/shopify/get-product";
//     const response = await postServer(url, data);
//     const product = response.response as ProductGET | null;
//     return product;
// }
