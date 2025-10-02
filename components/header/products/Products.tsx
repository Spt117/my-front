import { IShopifyProductSearch } from "@/components/header/products/shopifySearch";
import Image from "next/image";
import Link from "next/link";
import useShopifyStore from "../../shopify/shopifyStore";
import ProductToClick from "./ProductToClick";

export default function ProductList({ products }: { products: IShopifyProductSearch[] }) {
    const { shopifyBoutique, setSearchTerm } = useShopifyStore();
    if (!shopifyBoutique) return;
    const productBoutique = products.find((p) => p.domain === shopifyBoutique.domain);
    if (!productBoutique || products.length === 0) return <div>Aucun produit trouvé</div>;
    const id = productBoutique.id.split("/").pop();
    const url = `/product?id=${id}&shopify=${shopifyBoutique.locationHome}`;

    return (
        <div className="flex items-center">
            <Link href={url} className="flex-1" onClick={() => setSearchTerm("")}>
                <div className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm w-sm">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                            src={products[0].images.edges[0]?.node.url || "/no_image.png"}
                            alt={products[0].title}
                            fill
                            className="object-cover rounded-md"
                            sizes="48px"
                            priority={false}
                        />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{products[0].title}</h3>
                        <p className="text-sm text-muted-foreground">ID: {products[0].id.split("/").pop()}</p>
                        <div className="text-sm font-semibold text-primary">{`${products[0].variants.edges[0].node.price} ${shopifyBoutique?.devise}`}</div>
                    </div>
                </div>
            </Link>

            <div className="flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center gap-1">
                    <div className="w-[50px] h-[50px] relative">
                        <Image src="/shopify.png" alt="Shopify" fill sizes="50px" className="object-contain" />
                    </div>
                    {products.map((product, index) => (
                        <ProductToClick key={index} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
