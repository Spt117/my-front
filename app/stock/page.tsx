import { getStockVariant } from "@/library/models/variantShopify/middlewareVariants";
import MappingVariants from "./mappingVariants";

export default async function Page() {
    const data = await getStockVariant("bayblade-shops.myshopify.com");

    return <MappingVariants data={data} />;
}
