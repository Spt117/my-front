import { IShopifyProductResponse, IShopifyProductSearch } from "@/library/types/shopifySearch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useShopifyStore from "./shopifyStore";
import { postServer } from "@/library/utils/fetchServer";
import { toast } from "sonner";

export default function ProductList({ product }: { product: IShopifyProductSearch }) {
    const { shopifyBoutique, setSearchTerm, setProduct } = useShopifyStore();

    const router = useRouter();

    const handleClickShopify = () => {
        if (shopifyBoutique) {
            const shopifyUrl = `https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`;
            window.open(shopifyUrl, "_blank");
        }
    };

    const handlClickProduct = async () => {
        if (!shopifyBoutique) return;
        const id = product.id.split("/").pop();
        const url = `?id=${id}&shopify=${shopifyBoutique.locationHome}`;
        router.push(url);
        console.log(product);
        const url2 = "http://localhost:9100/shopify/get-product";
        const response = (await postServer(url2, { productId: product.id, domain: shopifyBoutique.domain })) as IShopifyProductResponse | null;
        if (!response) return;
        if (response.error) toast.error(response.message || "Erreur lors de la récupération du produit");
        if (!response.message) toast.success("Produit chargé avec succès");
        const productData = response as IShopifyProductResponse;
        setSearchTerm("");
        setProduct(productData.response);
    };
    return (
        <div onClick={handlClickProduct} key={product.id} className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={product.images.edges[0]?.node.url || "/no_image.png"} alt={product.title} fill className="object-cover rounded-md" sizes="48px" priority={false} />
            </div>
            <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.title}</h3>
                <p className="text-sm text-muted-foreground">ID: {product.id.split("/").pop()}</p>
                <div className="text-sm font-semibold text-primary">{`${product.variants.edges[0].node.price} ${shopifyBoutique.devise}`}</div>
            </div>
            <div onClick={handleClickShopify} className="cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm text-sm text-blue-600">
                <Image src="/shopify.png" alt="Shopify" width={50} height={50} className="object-contain" />
            </div>
        </div>
    );
}
