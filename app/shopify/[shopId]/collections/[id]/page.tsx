import { getDataBoutique } from "@/components/shopify/serverActions";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { boutiqueFromDomain, boutiqueFromId } from "@/params/paramsShopify";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ShopifyCollectionWithProducts } from "../utils";

export default async function CollectionPage() {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/unknown";

    const boutique = boutiqueFromId(pathname.split("/")[2]);
    const collectionData = (await getDataBoutique(
        boutique.domain,
        "collectionGid",
        `gid://shopify/Collection/${pathname.split("/")[4]}`
    )) as ResponseServer<ShopifyCollectionWithProducts>;

    if (!collectionData.response) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-600">Collection introuvable.</p>
            </div>
        );
    }

    const { title, description, image, products, seo, updatedAt } = collectionData.response;

    return (
        <div className="container mx-auto px-4 py-8">
            Collection Header
            <div className="mb-12">
                {image?.src && (
                    <div className="relative w-full h-96 mb-6">
                        <Image src={image.src} alt={image.altText || title} fill className="object-cover rounded-lg" priority />
                    </div>
                )}
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-gray-600 mb-4">{description}</p>
                <div className="text-sm text-gray-500">Dernière mise à jour : {new Date(updatedAt).toLocaleDateString()}</div>
                {seo?.description && <p className="text-sm text-gray-500 mt-2">{seo.description}</p>}
            </div>
            <div className="divide-y">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/shopify/${boutique.id}/products/${product.id.replace("gid://shopify/Product/", "")}`}
                        className="py-4 hover:bg-accent transition-colors flex items-center gap-4 cursor-pointer"
                    >
                        {product.featuredImage?.url ? (
                            <Image
                                src={product.featuredImage.url}
                                alt={product.featuredImage.altText || product.title}
                                className="object-cover rounded"
                                width={60}
                                height={60}
                            />
                        ) : (
                            <div className="w-[60px] h-[60px] bg-muted rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-muted-foreground text-xs">Aucune image</span>
                            </div>
                        )}
                        <h2 className="text-lg font-semibold flex-grow">{product.title}</h2>
                    </Link>
                ))}
            </div>
            {products.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Aucun produit disponible dans cette collection pour le moment.</p>
                </div>
            )}
        </div>
    );
}
