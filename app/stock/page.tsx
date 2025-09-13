import { variantController } from "@/library/models/produits/variantController";
import MappingVariants from "./mappingVariants";

export default async function Page() {
    const data = await variantController.getVariantRebuy();
    return <MappingVariants data={data} />;
}
