"use client";
import { cssCard } from "@/app/product/util";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import useUserStore from "@/library/stores/storeUser";
import { TagsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addTag } from "../../../components/shopify/serverActions";
import useShopifyStore from "../../../components/shopify/shopifyStore";
import { ITagRequest } from "../../../components/shopify/typesShopify";
import TagShopify from "./TagShopify";
import useKeyboardShortcuts from "@/library/hooks/useKyboardShortcuts";

export default function TagsShopify() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [newTag, setNewTag] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const { socket } = useUserStore();

    useEffect(() => {
        if (!socket) return;

        // Écouter les suggestions du serveur
        socket.on("tagSuggestions", (tags: string[]) => {
            setSuggestions(tags);
            setIsSearching(false);
            console.log("suggestions", tags);
        });

        return () => {
            socket.off("tagSuggestions");
        };
    }, [socket]);

    useEffect(() => {
        // Ne pas faire de requête si on est en train de sélectionner
        if (!socket || !shopifyBoutique?.domain || !isSearching) return;

        const timer = setTimeout(() => {
            socket.emit("searchTags", newTag, shopifyBoutique?.domain);
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timer);
    }, [newTag, socket, shopifyBoutique?.domain, isSearching]);

    if (!product || !shopifyBoutique) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewTag(value);

        if (value.length === 0) {
            setSuggestions([]); // Effacer les suggestions si input vide
            setIsSearching(false);
        } else {
            setIsSearching(true); // Activer la recherche si du texte
        }
    };

    const handleSelectSuggestion = (tag: string) => {
        setNewTag(tag);
        setSuggestions([]);
        setIsSearching(false); // Arrêter les requêtes
    };

    const handleAddTag = async () => {
        if (!newTag.trim()) {
            toast.error("Le tag ne peut pas être vide.");
            return;
        }
        setLoading(true);
        setSuggestions([]);
        setIsSearching(false);

        const data: ITagRequest = { tag: newTag, productId: product.id, domain: shopifyBoutique.domain };
        try {
            const res = await addTag(data);
            if (res?.error) toast.error(res.error);
            if (res?.message) {
                setNewTag("");
                toast.success(res.message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the tag.");
        } finally {
            setLoading(false);
        }
    };

    useKeyboardShortcuts("Escape", () => handleSelectSuggestion(""));

    return (
        <Card className={cssCard}>
            <CardContent className="space-y-6">
                <h3 className="m-2 text-sm font-medium flex items-center gap-2">
                    <TagsIcon size={15} />
                    Tags
                </h3>
                <div className="relative flex gap-2 flex-wrap">
                    <Input type="text" placeholder="Ajouter un tag" onChange={handleInputChange} value={newTag} />
                    {suggestions.length > 0 && (
                        <ul className="absolute top-9 z-10 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                            {suggestions.map((tag, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectSuggestion(tag)}
                                    className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0 text-sm text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    )}
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
