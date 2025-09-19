"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCopy } from "@/library/hooks/useCopy";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import Tags from "./Tags/Tags";
import Metafields from "./Metafields/Metafields";
import Amazon from "./Metafields/Amazon";
import Video from "./Metafields/Video";

export default function Product() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { handleCopy } = useCopy();
    const [isCopied, setIsCopied] = useState({ title: false, sku: false, id: false });

    if (!product || !shopifyBoutique) {
        return <div className="text-center py-8 text-muted-foreground">Aucun produit sélectionné</div>;
    }

    const images = product.media.nodes;
    const mainVariant = product.variants.nodes[0];

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const productUrl = `https://${shopifyBoutique.domain}/products/${product.handle}`;

    // Fonction générique pour copier avec animation
    const handleCopyWithAnimation = (value: string, animationType: "id" | "sku" | "title") => {
        handleCopy(value);

        if (animationType === "id") {
            setIsCopied((prev) => ({ ...prev, id: true }));
            setTimeout(() => setIsCopied((prev) => ({ ...prev, id: false })), 100);
        } else if (animationType === "sku") {
            setIsCopied((prev) => ({ ...prev, sku: true }));
            setTimeout(() => setIsCopied((prev) => ({ ...prev, sku: false })), 100);
        } else if (animationType === "title") {
            setIsCopied((prev) => ({ ...prev, title: true }));
            setTimeout(() => setIsCopied((prev) => ({ ...prev, title: false })), 100);
        }
    };

    if (product)
        return (
            <Card className="">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle
                            onClick={() => {
                                handleCopyWithAnimation(product.title, "title");
                            }}
                            className={`
                flex items-center gap-2 
                text-lg font-semibold 
                cursor-pointer 
                hover:text-gray-900 
                `}
                            title="Cliquer pour copier le titre"
                        >
                            {product.title}
                            <Copy
                                size={18}
                                className={`text-gray-500 transition-transform duration-100 ${isCopied.title ? "scale-75" : ""}`}
                            />
                        </CardTitle>
                        <div className="flex gap-2">
                            <a
                                href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                <Button className="hover:bg-gray-600">Edit in Shopify</Button>
                            </a>
                            <a
                                href={productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                <Button className="hover:bg-gray-600">Aperçu</Button>
                            </a>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Vendu par {product.vendor} | Catégorie: {product.category?.name || "Non spécifié"}
                    </div>
                </CardHeader>
                <CardContent className="grid flex gap-6 flex-wrap md:flex-nowrap md:grid-cols-2">
                    {/* Carrousel d'images */}
                    <div className="relative w-full max-w-md min-w-[250px] flex flex-col gap-2">
                        {/* Image principale */}
                        <div className="relative aspect-square">
                            <Image
                                priority={true}
                                src={images[currentImageIndex]?.image?.url || "/no_image.png"}
                                alt={images[currentImageIndex]?.alt || product.title}
                                fill
                                loading="eager"
                                sizes="10vw"
                                className="object-cover rounded-lg"
                            />
                            {/* Boutons de navigation sur l'image principale */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                        onClick={handlePrevImage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                        onClick={handleNextImage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                        <Video />

                        {/* Aperçus des images (thumbnails) */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                                            index === currentImageIndex
                                                ? "border-primary shadow-md"
                                                : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        <Image
                                            src={img.image?.url || "/no_image.png"}
                                            alt={img.alt || `${product.title} ${index + 1}`}
                                            fill
                                            className="object-cover cursor-pointer"
                                            sizes="64px"
                                            loading="lazy"
                                        />
                                        w{/* Overlay pour l'image active */}
                                        {index === currentImageIndex && <div className="absolute inset-0 bg-primary/10" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Détails du produit */}
                    <div className="space-y-4">
                        {/* Prix et comparaison */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold text-primary">
                                {mainVariant?.price || "Prix indisponible"}
                            </span>
                            {mainVariant?.compareAtPrice && (
                                <span className="text-lg text-muted-foreground line-through">{mainVariant.compareAtPrice}</span>
                            )}
                            <span>{shopifyBoutique.devise}</span>
                        </div>

                        {/* SKU, stock et politique d'inventaire */}
                        <div className="text-sm text-muted-foreground flex flex-col gap-1">
                            <p
                                className="cursor-pointer flex items-center gap-1 text-gray-700 hover:text-gray-900"
                                onClick={() => handleCopyWithAnimation(product.id.split("/").pop() || "", "id")}
                                title="Cliquer pour copier l'ID"
                            >
                                Id: {product.id.split("/").pop()}
                                <Copy
                                    size={12}
                                    className={`text-gray-500 transition-transform duration-100 ${isCopied.id ? "scale-75" : ""}`}
                                />
                            </p>
                            <p
                                className="cursor-pointer flex items-center gap-1 text-gray-700 hover:text-gray-900"
                                onClick={() => handleCopyWithAnimation(mainVariant.sku, "sku")}
                                title="Cliquer pour copier le SKU"
                            >
                                SKU: {mainVariant.sku}
                                <Copy
                                    size={12}
                                    className={`text-gray-500 transition-transform duration-100 ${
                                        isCopied.sku ? "scale-75" : ""
                                    }`}
                                />
                            </p>
                            <p>Barcode: {mainVariant?.barcode || "Non disponible"}</p>
                            <p>
                                Stock:{" "}
                                {mainVariant?.inventoryQuantity > 0
                                    ? `${mainVariant.inventoryQuantity} disponibles`
                                    : "Rupture de stock"}
                            </p>
                            <Amazon />
                        </div>

                        {/* Options */}
                        {product.options.length > 1 && (
                            <div>
                                <h3 className="text-lg font-medium">Options</h3>
                                <div className="text-sm text-muted-foreground">
                                    {product.options.map((option, index) => (
                                        <p key={index}>
                                            {option.name}:{" "}
                                            {option.values.map((v) => (typeof v === "string" ? v : v.name)).join(", ")}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metafields */}
                        <Metafields metafields={product.metafields.nodes} />
                        <Tags />
                    </div>
                </CardContent>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-medium">Description</h3>
                        <div
                            className="text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{
                                __html: product.descriptionHtml || "<p>Aucune description disponible</p>",
                            }}
                        />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="text-sm text-muted-foreground">
                        <p>Type de produit: {product.productType || "Non spécifié"}</p>
                        <p>Statut: {product.status}</p>
                        <p>Créé le: {new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
                        <p>Mis à jour le: {new Date(product.updatedAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                </CardContent>
            </Card>
        );
}
