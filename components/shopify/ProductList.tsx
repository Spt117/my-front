import Image from "next/image";
import { IShopifyProductSearch } from "@/library/types/shopifySearch";
import { useRouter } from "next/navigation";
import useShopifyStore from "./shopifyStore";

export default function ProductList({ product }: { product: IShopifyProductSearch }) {
    const { shopifyBoutique, setSearchTerm } = useShopifyStore();
    const router = useRouter();

    const handlClickProduct = (product: IShopifyProductSearch) => {
        const id = product.id.split("/").pop();
        const url = `/${shopifyBoutique?.locationHome}?id=${id}`;
        setSearchTerm("");
        router.push(url);
    };
    return (
        <div onClick={() => handlClickProduct(product)} key={product.id} className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={product.images.edges[0]?.node.url || "/no_image.png"} alt={product.title} fill className="object-cover rounded-md" sizes="48px" priority={false} />
            </div>
            <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.title}</h3>
                <p className="text-sm text-muted-foreground">ID: {product.id.split("/").pop()}</p>
            </div>
            <div className="text-sm font-semibold text-primary">{product.variants.edges[0]?.node.price || "Prix indisponible"}</div>
        </div>
    );
}
