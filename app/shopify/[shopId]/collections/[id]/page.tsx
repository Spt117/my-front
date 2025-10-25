"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import Image from "next/image";
import Link from "next/link";
import useCollectionStore from "../storeCollections";
import { useRouter } from "next/navigation";
import { deleteCollection } from "../server";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProductCollection from "./Product";

export default function Page() {
    const { dataCollection } = useCollectionStore();
    const { shopifyBoutique } = useShopifyStore();
    const router = useRouter();

    // ✅ Changez return; en return null;
    if (!dataCollection || !shopifyBoutique) return null;

    const { title, description, image, products, seo, updatedAt } = dataCollection;

    const handleDeleteCollection = async () => {
        const response = await deleteCollection(shopifyBoutique.domain, dataCollection.id);
        if (response.message) {
            toast.success(response.message);
            router.push(`/shopify/${shopifyBoutique.id}/collections`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Collection Header */}
            <div className="mb-12 flex justify-between ">
                <div>
                    {image?.src && (
                        <div className="relative w-full h-96 mb-6">
                            <Image
                                src={image.src}
                                alt={image.altText || title}
                                fill
                                className="object-cover rounded-lg"
                                priority
                            />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-gray-600 mb-4">{description}</p>
                    <div className="text-sm text-gray-500">Dernière mise à jour : {new Date(updatedAt).toLocaleDateString()}</div>
                    {seo?.description && <p className="text-sm text-gray-500 mt-2">{seo.description}</p>}
                </div>
                <Button variant="destructive" className="mt-4" onClick={handleDeleteCollection}>
                    Supprimer la collection
                </Button>
            </div>
            <div className="divide-y">
                {products.map((product) => (
                    <ProductCollection key={product.id} product={product} />
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
