import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ShopifyCollection } from "./utils";

export default function CollectionRow({ collection }: { collection: ShopifyCollection }) {
    const router = useRouter();
    const params = useParams();
    const { shopifyBoutique } = useShopifyStore();
    const [isHovered, setIsHovered] = useState(false);

    const handleRowClick = () => {
        const url = `/shopify/${params.shopId}/collections/${collection.id.replace("gid://shopify/Collection/", "")}`;
        router.push(url);
    };

    const collectionUrl = `https://${shopifyBoutique?.publicDomain}/collections/${collection.handle}`;

    return (
        <TableRow
            className="h-14 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
            onClick={handleRowClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TableCell className="p-0 cursor-pointer ">
                <div className="flex items-center justify-center">
                    <Checkbox />
                </div>
            </TableCell>
            <TableCell>
                <Image
                    src={collection?.image?.src || "/no_image.png"}
                    alt={collection?.image?.altText || collection.title}
                    className="w-12 h-12 object-cover rounded"
                    width={48}
                    height={48}
                />
            </TableCell>
            <TableCell className="font-medium">{collection.title}</TableCell>
            <TableCell>
                <Badge
                    variant={collection.ruleSet ? "default" : "secondary"}
                    className={collection.ruleSet ? "bg-blue-500 hover:bg-blue-500" : "bg-green-500 hover:bg-green-500"}
                >
                    {collection.ruleSet ? "Automatique" : "Manuelle"}
                </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{collection.handle}</TableCell>
            <TableCell>
                <div className="flex items-center justify-center w-full h-14">
                    <a
                        onClick={(e) => e.stopPropagation()}
                        href={collectionUrl}
                        className="p-1 hover:bg-gray-200 rounded-md right-3 "
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span
                            title="Afficher sur votre boutique"
                            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <Eye size={20} color={isHovered ? "currentColor" : "transparent"} />
                        </span>
                    </a>
                </div>
            </TableCell>
        </TableRow>
    );
}
