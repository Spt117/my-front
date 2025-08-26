import { SegmentParams } from "@/library/types/utils";
import Product from "./Product";
import AddImage from "./AddImage";
import { boutiqueFromLocation } from "@/library/params/paramsShopify";
import { getProduct } from "@/components/shopify/serverActions";

export default async function Page({ params, searchParams }: { params: Promise<SegmentParams>; searchParams: Promise<SegmentParams> }) {
    const p = await params;
    const query = await searchParams;

    const boutique = boutiqueFromLocation(p.shopify);
    if (!boutique || !query.id) return <div>No domain or product ID provided</div>;

    const data = {
        productId: query.id,
        domain: boutique.domain,
    };

    const product = await getProduct(data);

    if (!product) return <div>Product not found</div>;
    return (
        <>
            <AddImage />
            <Product data={product} boutique={boutique} />
        </>
    );
}
