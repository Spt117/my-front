"use client";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import useShopifyStore from "./shopifyStore";
import { useRouter } from "next/navigation";
import { IShopifyProductSearch } from "@/library/types/shopifySearch";

export default function ListProducts() {
    const { productsSearch, shopifyBoutique, setSearchTerm, searchTerm, loading } = useShopifyStore();
    const router = useRouter();

    if (productsSearch.length === 0 && !searchTerm) return null;

    const handlClickProduct = (product: IShopifyProductSearch) => {
        const id = product.id.split("/").pop();
        const url = `/${shopifyBoutique?.locationHome}?id=${id}`;
        setSearchTerm("");
        router.push(url);
    };

    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {productsSearch.map((product) => (
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
            ))}
            {!loading && searchTerm && productsSearch.length === 0 && (
                <div className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="relative w-12 h-12 flex-shrink-0"></div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">Aucun produit trouvé pour "{searchTerm}"</h3>
                    </div>
                </div>
            )}
            <Separator />
        </div>
    );
}
