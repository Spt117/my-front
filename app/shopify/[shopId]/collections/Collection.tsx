import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShopifyCollection } from "./utils";

export default function CollectionRow({ collection }: { collection: ShopifyCollection }) {
    const router = useRouter();

    const handleRowClick = () => {
        const url = `/shopify/25754107976/collections/${collection.id.replace("gid://shopify/Collection/", "")}`;
        router.push(url);
    };

    return (
        <TableRow className="h-14 hover:bg-muted/50 transition-colors duration-200 cursor-pointer" onClick={handleRowClick}>
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
            <TableCell className="text-right">
                <Badge variant="outline" className="text-xs">
                    {collection.id}
                </Badge>
            </TableCell>
        </TableRow>
    );
}
