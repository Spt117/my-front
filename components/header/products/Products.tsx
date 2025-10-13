import Image from "next/image";
import Link from "next/link";
import useShopifyStore from "../../shopify/shopifyStore";
import { ProductGET } from "@/library/types/graph";

export default function ProductList({ product }: { product: ProductGET }) {
    const { shopifyBoutique, setSearchTerm } = useShopifyStore();
    if (!shopifyBoutique) return;
    const id = product.id.split("/").pop();
    const url = `/product?id=${id}&shopify=${shopifyBoutique.locationHome}`;

    return (
        <div className="flex items-center">
            <Link href={url} className="flex-1" onClick={() => setSearchTerm("")}>
                <div className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm w-sm">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                            src={product.images.nodes[0]?.url || "/no_image.png"}
                            alt={product.title}
                            fill
                            className="object-cover rounded-md"
                            sizes="48px"
                            priority={false}
                        />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">ID: {product.id.split("/").pop()}</p>
                        <div className="text-sm font-semibold text-primary">{`${product.variants?.nodes[0]?.price} ${shopifyBoutique?.devise}`}</div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
