import useShopifyStore from "../shopifyStore";

export default function Prices() {
    const { product, shopifyBoutique } = useShopifyStore();
    if (!product || !shopifyBoutique) return null;

    const mainVariant = product.variants.nodes[0];

    return (
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-primary">{mainVariant?.price || "Prix indisponible"}</span>
            {mainVariant?.compareAtPrice && (
                <span className="text-lg text-muted-foreground line-through">{mainVariant.compareAtPrice}</span>
            )}
            <span>{shopifyBoutique.devise}</span>
        </div>
    );
}
