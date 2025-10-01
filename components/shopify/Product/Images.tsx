"use client";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/library/hooks/useCopy";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import useShopifyStore from "../shopifyStore";

export default function ImagesProduct() {
    const { product } = useShopifyStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { handleCopy } = useCopy();

    if (!product) return null;
    const images = product.media.nodes;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    return (
        <div className="relative w-1/4 flex flex-col gap-2">
            {/* Image principale */}
            <div className="relative aspect-square">
                <Image
                    priority={true}
                    src={images[currentImageIndex]?.image?.url || "/no_image.png"}
                    alt={images[currentImageIndex]?.alt || product.title}
                    loading="eager"
                    className="object-cover rounded-lg"
                    width={750}
                    height={750}
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
                                index === currentImageIndex ? "border-primary shadow-md" : "border-gray-200 hover:border-gray-400"
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
            <div className="flex flex-col gap-1">
                {images.length > 1 &&
                    images.map((img, index) => (
                        <p
                            key={index}
                            className="text-xs text-muted-foreground break-all cursor-pointer hover:underline active:text-primary "
                            onClick={() => handleCopy(img.image?.url || "")}
                        >
                            {img.image?.url}
                        </p>
                    ))}
            </div>
        </div>
    );
}
