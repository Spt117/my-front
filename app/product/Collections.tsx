import { Card, CardContent } from "@/components/ui/card";
import { Label } from "recharts";
import { cssCard } from "./util";
import useShopifyStore from "@/components/shopify/shopifyStore";
import Link from "next/link";

export default function Collections() {
    const { product, shopifyBoutique } = useShopifyStore();
    const collections = product?.collections.edges.map((edge) => edge.node) || [];

    return (
        <Card className={cssCard}>
            <CardContent className="p-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Collections</h3>
                    <p className="text-sm text-gray-500">
                        {collections.length} {collections.length !== 1 ? "collections" : "collection"} active
                        {collections.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {collections.length === 0 && <Label className="text-sm text-gray-500">Aucune collection</Label>}
                    {collections.map((collection) => (
                        <div key={collection.id} className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.id.replace("gid://shopify/Collection/", "")}?domain=${
                                    shopifyBoutique?.domain
                                }`}
                                className="hover:underline w-full block"
                            >
                                {collection.title}
                            </Link>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
