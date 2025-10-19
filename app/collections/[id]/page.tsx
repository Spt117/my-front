import { getDataBoutique } from "@/components/shopify/serverActions";
import { boutiqueFromDomain, TDomainsShopify } from "@/params/paramsShopify";
import { SegmentParams } from "@/library/types/utils";
import { ResponseServer } from "@/components/shopify/typesShopify";
import { ShopifyCollectionWithProducts } from "../utils";
import Image from "next/image";
import Link from "next/link";

export default async function CollectionPage({ params, searchParams }: { searchParams: Promise<SegmentParams>; params: Promise<SegmentParams> }) {
    const query = (await searchParams) as { domain: TDomainsShopify };
    const p = (await params) as { id: string };

    const collectionData = (await getDataBoutique(query.domain, "collectionGid", `gid://shopify/Collection/${p.id}`)) as ResponseServer<ShopifyCollectionWithProducts>;

    const { title, description, image, products, seo, updatedAt } = collectionData.response;

    const boutique = boutiqueFromDomain(query.domain);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Collection Header */}
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

            {/* Products Grid */}
            <div className="divide-y">
                {products.map((product) => (
                    <Link key={product.id} href={`/product?id=${product.id.replace("gid://shopify/Product/", "")}&shopify=${boutique.locationHome}`} className="py-4 hover:bg-accent transition-colors flex items-center gap-4 cursor-pointer">
                        {product.featuredImage?.url ? (
                            <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} className="object-cover rounded" width={60} height={60} />
                        ) : (
                            <div className="w-[60px] h-[60px] bg-muted rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-muted-foreground text-xs">Aucune image</span>
                            </div>
                        )}
                        <h2 className="text-lg font-semibold flex-grow">{product.title}</h2>
                    </Link>
                ))}
            </div>

            {/* No Products Message */}
            {products.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Aucun produit disponible dans cette collection pour le moment.</p>
                </div>
            )}
        </div>
    );
}
