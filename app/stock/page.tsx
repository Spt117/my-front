import { getStockVariant } from "@/library/models/produits/middlewareVariants";
import MappingVariants from "./mappingVariants";

export default async function Page() {
    const data = await getStockVariant();

    return <MappingVariants data={data} />;
}
