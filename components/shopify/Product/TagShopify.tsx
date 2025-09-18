import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react"; // On utilise une icône de croix de lucide-react
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTag } from "../serverActions";
import useShopifyStore from "../shopifyStore";
import { ITagRequest } from "../typesShopify";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useProduct } from "@/library/hooks/useProduct";

export default function TagShopify({ tag }: { tag: string }) {
    const { product, shopifyBoutique } = useShopifyStore();
    const [loading, setLoading] = useState(false);
    const { getProductUpdate } = useProduct();
    if (!product || !shopifyBoutique) return null;

    const onRemove = async () => {
        setLoading(true);
        try {
            const params: ITagRequest = { tag, productId: product.id, domain: shopifyBoutique.domain };
            const res = await deleteTag(params);
            if (res?.error) toast.error(res.error);
            if (res?.message) {
                await getProductUpdate();
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the tag.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block group">
            <Badge variant="secondary" className="transition-all duration-200 group-hover:shadow-md group-hover:bg-gray-100">
                {tag}
                {!loading && (
                    <button
                        onClick={onRemove}
                        className="cursor-pointer absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
                <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
            </Badge>
        </div>
    );
}
