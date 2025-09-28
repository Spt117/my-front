import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { useProduct } from "@/library/hooks/useProduct";
import { useState } from "react";
import { toast } from "sonner";
import { addTag } from "../../serverActions";
import useShopifyStore from "../../shopifyStore";
import { ITagRequest } from "../../typesShopify";
import TagShopify from "./TagShopify";
import { TagsIcon } from "lucide-react";

export default function TagsShopify() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [newTag, setNewTag] = useState("");
    const { getProductUpdate } = useProduct();
    const [loading, setLoading] = useState(false);
    if (!product || !shopifyBoutique) return null;

    const handleAddTag = async () => {
        if (!newTag.trim()) {
            toast.error("Le tag ne peut pas être vide.");
            return;
        }
        setLoading(true);
        const data: ITagRequest = { tag: newTag, productId: product.id, domain: shopifyBoutique.domain };
        try {
            const res = await addTag(data);
            if (res?.error) toast.error(res.error);
            if (res?.message) {
                await getProductUpdate();
                setNewTag("");
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the tag.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white w-min h-min">
            <CardContent className="space-y-6">
                <h3 className="m-2 text-sm font-medium flex items-center gap-2">
                    <TagsIcon size={15} />
                    Tags
                </h3>
                <div className="flex gap-2">
                    <Input type="text" placeholder="Ajouter un tag" onChange={(e) => setNewTag(e.target.value)} value={newTag} />
                    <Button disabled={!newTag.trim() || loading} onClick={handleAddTag}>
                        Ajouter un tag
                        <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                    </Button>
                </div>
                {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {product.tags.map((tag) => (
                            <TagShopify key={tag} tag={tag} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
