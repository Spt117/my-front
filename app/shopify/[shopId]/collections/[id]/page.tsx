"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import useCollectionStore from "../storeCollections";
import Canaux from "./Canaux";
import HeaderCollection from "./header/HeaderCollection";
import MetaSeo from "./MetaSeo";
import ProductCollection from "./Product";

export default function Page() {
    const { dataCollection } = useCollectionStore();
    const { shopifyBoutique, openDialog } = useShopifyStore();

    if (!dataCollection || !shopifyBoutique) return null;

    const { title, description, image, products, seo, updatedAt } = dataCollection;

    return (
        <div className="@container/main flex flex-1 flex-col relative">
            {/* Collection Header */}
            <Card className="m-0 p-0 border-0 shadow-none">
                <HeaderCollection />
                <CardContent className="flex flex-wrap gap-5 p-2 justify-center max-[1600px]:justify-center ">
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
                    <p className="text-gray-600 mb-4">{description}</p>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-wrap gap-3 justify-center  h-min">
                            <Canaux collection={dataCollection} />
                            <MetaSeo />
                        </div>
                        <hr />
                        <div className="divide-y">
                            {products.map((product) => (
                                <ProductCollection key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Aucun produit disponible dans cette collection pour le moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
