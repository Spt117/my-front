import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "recharts";
import { toast } from "sonner";
import { updateProduct } from "./serverAction";
import { cssCard } from "./util";

export default function Collections() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [typeProduct, setTypeProduct] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const collections = product?.collections.edges.map((edge) => edge.node) || [];

    const boolSave = typeProduct.trim() !== product?.productType;

    useEffect(() => {
        if (product && product.productType) {
            setTypeProduct(product.productType);
        }
    }, [product]);

    const handleSave = async () => {
        if (!boolSave || !product || !shopifyBoutique) return;
        setLoading(true);
        try {
            const res = await updateProduct(shopifyBoutique.domain, product.id, "type", typeProduct);
            if (res.message) toast.success(res.message);
            if (res.error) toast.error(res.error);
        } catch (e) {
            toast.error("Une erreur est survenue lors de la sauvegarde.");
            console.log(e);
        } finally {
            setLoading(false);
            router.refresh();
        }
    };

    useKeyboardShortcuts("Enter", () => handleSave());

    return (
        <Card className={cssCard}>
            {boolSave && !loading && <Save className="cursor-pointer absolute top-3 right-3" onClick={handleSave} />}
            {loading && <Spinner className="text-gray-600 absolute top-3 right-3" />}

            <CardContent className="p-2">
                <h2 className="text-xl font-bold mb-4">Organisation du produit</h2>
                <h3 className="text-lg font-semibold text-gray-900">Type</h3>
                <Input value={typeProduct} onChange={(e) => setTypeProduct(e.target.value)} className="w-full mt-2" />

                <hr className="mb-3 mt-5" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Collections</h3>
                    <p className="text-sm text-gray-500">
                        {collections.length} {collections.length !== 1 ? "collections" : "collection"} active
                        {collections.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {collections.length === 0 && <Label className="text-sm text-gray-500">Aucune collection</Label>}
                    {collections.map((collection) => {
                        const endpoint = `/shopify/${shopifyBoutique?.id}/collections/${collection.id.replace(
                            "gid://shopify/Collection/",
                            ""
                        )}`;
                        return (
                            <div key={collection.id} className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                                <Link key={collection.id} href={endpoint} className="hover:underline w-full block">
                                    {collection.title}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
