"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCopy } from "@/library/hooks/useCopy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import TagShopify from "./TagShopify";

export default function Product() {
    const { product, shopifyBoutique } = useShopifyStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { handleCopy } = useCopy();
    const [isCopied, setIsCopied] = useState(false);

    const handleClickTitle = () => {
        handleCopy(product?.title || "");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 5000);
    };

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

    if (product)
        return (
            <Card className="">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle
                            onClick={handleClickTitle}
                            className={`
                text-2xl font-bold cursor-pointer hover:underline
                transition-transform duration-100 ease-in-out
                active:scale-95 active:shadow-inner
                ${isCopied ? "text-green-500" : "text-black"}
            `}
                        >
                            {product.title}
                        </CardTitle>
                        <a
                            href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            <Button>Edit in Shopify</Button>
                        </a>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Vendu par {product.vendor} | Catégorie: {product.category?.name || "Non spécifié"}
                    </div>
                </CardHeader>
                <CardContent className="grid flex gap-6 flex-wrap md:flex-nowrap md:grid-cols-2">
                    {/* Carrousel d'images */}
                    <div className="relative w-full max-w-md min-w-[250px]">
                        {/* Image principale */}
                        <div className="relative aspect-square mb-3">
                            <Image
                                priority={true}
                                src={images[currentImageIndex]?.image?.url || "/no_image.png"}
                                alt={images[currentImageIndex]?.alt || product.title}
                                fill
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
                        <div className="text-sm text-muted-foreground">
                            <p className="cursor-pointer" onClick={() => handleCopy(product.id.split("/").pop() || "")}>
                                Id: {product.id.split("/").pop()}
                            </p>
                            <p>SKU: {mainVariant?.sku || "Non disponible"}</p>
                            <p>Barcode: {mainVariant?.barcode || "Non disponible"}</p>
                            <p>
                                Stock:{" "}
                                {mainVariant?.inventoryQuantity > 0
                                    ? `${mainVariant.inventoryQuantity} disponibles`
                                    : "Rupture de stock"}
                            </p>
                            <p>
                                Politique d'inventaire:{" "}
                                {mainVariant?.inventoryPolicy === "CONTINUE" ? "Continuer après rupture" : "Arrêter à rupture"}
                            </p>
                        </div>

                        {/* Options */}
                        {product.options.length > 0 && (
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
                        {product.metafields.nodes.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium">Informations supplémentaires</h3>
                                <div className="text-sm text-muted-foreground">
                                    <ul>
                                        {product.metafields.nodes.map((metafield) => (
                                            <React.Fragment key={metafield.id}>
                                                <li
                                                    className="cursor-pointer hover:underline"
                                                    onClick={() => {
                                                        handleCopy(metafield.value);
                                                    }}
                                                >
                                                    {metafield.key}: {metafield.value}
                                                </li>
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
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

                    {/* Tags */}
                    {product.tags.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium">Tags</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.tags.map((tag) => (
                                    <TagShopify key={tag} tag={tag} />
                                ))}
                            </div>
                        </div>
                    )}

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
