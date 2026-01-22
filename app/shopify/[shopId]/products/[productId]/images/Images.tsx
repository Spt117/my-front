"use client";
import { reorderMedia } from "@/components/shopify/serverActions";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import AddImage from "./AddImage";

// Type pour les médias (images) du produit
interface MediaNode {
    id: string;
    alt: string;
    image: {
        url: string;
        width: number;
        height: number;
    };
}

/**
 * Composant de galerie d'images avec fonctionnalité de drag & drop
 * Permet de réordonner les images par glisser-déposer comme sur Shopify
 */
export default function ImagesProduct() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { getProductData } = useDataProduct();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!product || !shopifyBoutique) return null;

    const images: MediaNode[] = product.media.nodes;

    // === NAVIGATION ===
    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // === DRAG & DROP ===
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Ajouter une image fantôme transparente (optionnel)
        const img = new window.Image();
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        e.dataTransfer.setDragImage(img, 0, 0);
    }, []);

    const handleDragOver = useCallback(
        (e: React.DragEvent, index: number) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (draggedIndex !== null && draggedIndex !== index) {
                setDragOverIndex(index);
            }
        },
        [draggedIndex],
    );

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent, dropIndex: number) => {
            e.preventDefault();
            setDragOverIndex(null);

            if (draggedIndex === null || draggedIndex === dropIndex) {
                setDraggedIndex(null);
                return;
            }

            // Calculer les mouvements nécessaires pour le réordonnancement
            const moves = [{ id: images[draggedIndex].id, newPosition: dropIndex }];

            setIsSaving(true);
            try {
                const res = await reorderMedia({
                    domain: shopifyBoutique.domain,
                    productId: product.id,
                    moves,
                });

                if (res?.error) {
                    toast.error(res.error);
                } else {
                    toast.success("Ordre des images mis à jour");
                    // Rafraîchir les données du produit
                    await getProductData();
                    // Ajuster l'index de l'image courante si nécessaire
                    if (currentImageIndex === draggedIndex) {
                        setCurrentImageIndex(dropIndex);
                    } else if (draggedIndex < currentImageIndex && dropIndex >= currentImageIndex) {
                        setCurrentImageIndex(currentImageIndex - 1);
                    } else if (draggedIndex > currentImageIndex && dropIndex <= currentImageIndex) {
                        setCurrentImageIndex(currentImageIndex + 1);
                    }
                }
            } catch (error) {
                console.error("Error reordering images:", error);
                toast.error("Erreur lors du réordonnancement");
            } finally {
                setIsSaving(false);
                setDraggedIndex(null);
            }
        },
        [draggedIndex, images, shopifyBoutique, product, getProductData, currentImageIndex],
    );

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    return (
        <Card className="w-full h-min p-5 gap-0">
            <div className="relative flex gap-4 flex-wrap justify-center">
                {/* === IMAGE PRINCIPALE === */}
                <div className="max-w-[350px] h-min">
                    {images.length > 0 ? (
                        <div className="relative aspect-square flex items-center justify-center rounded-lg overflow-hidden bg-gray-50">
                            <Image
                                priority={true}
                                src={images[currentImageIndex]?.image?.url || "/no_image.png"}
                                alt={images[currentImageIndex]?.alt || product.title}
                                loading="eager"
                                className="object-contain"
                                width={750}
                                height={750}
                            />

                            {/* Contrôles de navigation */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
                                        onClick={handlePrevImage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
                                        onClick={handleNextImage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </>
                            )}

                            {/* Indicateur de position */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">Aucune image</div>
                    )}

                    {/* === THUMBNAILS AVEC DRAG & DROP === */}
                    {images.length > 1 && (
                        <div className="mt-3">
                            <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                                <GripVertical size={14} />
                                <span>Glissez pour réordonner</span>
                                {isSaving && <Spinner className="ml-2 w-3 h-3" />}
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`
                                            flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden 
                                            border-2 transition-all cursor-grab active:cursor-grabbing
                                            ${index === currentImageIndex ? "border-blue-500 shadow-md ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"}
                                            ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                                            ${dragOverIndex === index ? "border-blue-400 border-dashed scale-105" : ""}
                                        `}
                                    >
                                        <Image
                                            src={img.image?.url || "/no_image.png"}
                                            alt={img.alt || `${product.title} ${index + 1}`}
                                            fill
                                            className="object-cover pointer-events-none"
                                            sizes="64px"
                                            loading="lazy"
                                        />

                                        {/* Badge numéro */}
                                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">{index + 1}</div>

                                        {/* Indicateur première image (image principale) */}
                                        {index === 0 && <div className="absolute top-0 left-0 bg-blue-500 text-white text-[8px] px-1 rounded-br font-bold">★</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* === SECTION AJOUT D'IMAGES === */}
                <AddImage />
            </div>
        </Card>
    );
}
