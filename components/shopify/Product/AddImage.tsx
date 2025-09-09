"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { postServer } from "@/library/utils/fetchServer";
import { X, Plus, ImageIcon } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

interface IAddImageParams {
    url: string;
    name: string;
    altText: string;
}

const EMPTY_IMAGE: IAddImageParams = { url: "", name: "", altText: "" };

export default function AddImage() {
    const { product, shopifyBoutique, setProduct } = useShopifyStore();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<IAddImageParams[]>([EMPTY_IMAGE]);

    // Mémoisation pour éviter les re-rendus inutiles
    const canAddImages = useMemo(() => {
        return Boolean(shopifyBoutique && product && images.every((img) => img.url.trim() && img.name.trim()));
    }, [shopifyBoutique, product, images]);

    // Callbacks mémorisés pour éviter les re-créations
    const handleAddImageField = useCallback(() => {
        setImages((prev) => [...prev, { ...EMPTY_IMAGE }]);
    }, []);

    const handleRemoveImageField = useCallback((index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleImageChange = useCallback((index: number, field: keyof IAddImageParams, value: string) => {
        setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = { ...newImages[index], [field]: value };
            return newImages;
        });
    }, []);

    const handleAddImages = useCallback(async () => {
        if (!canAddImages) return;

        setLoading(true);

        try {
            // Filtrer et nettoyer les images valides
            const validImages = images
                .filter((img) => img.url.trim() && img.name.trim())
                .map((img) => ({
                    url: img.url.trim(),
                    name: img.name.trim(),
                    altText: img.altText.trim(),
                }));

            // Ajouter toutes les images en parallèle
            await Promise.allSettled(
                validImages.map((image) =>
                    postServer("http://localhost:9100/shopify/add-image", {
                        domain: shopifyBoutique!.domain,
                        productId: product!.id,
                        image,
                    })
                )
            );

            // Récupérer le produit mis à jour
            const paramsProduct = {
                domain: shopifyBoutique!.domain,
                productId: product!.id,
            };

            // const updatedProduct = await getProduct(paramsProduct);
            // setProduct(updatedProduct);

            // Réinitialiser le formulaire
            setImages([{ ...EMPTY_IMAGE }]);
        } catch (error) {
            console.error("Erreur lors de l'ajout des images:", error);
            // Vous pourriez ajouter ici un toast d'erreur
        } finally {
            setLoading(false);
        }
    }, [canAddImages, images, shopifyBoutique, product, setProduct]);

    // Early return si pas de produit sélectionné
    if (!product) {
        return <div className="mx-4 my-8 p-4 border rounded-lg text-center text-gray-500">Aucun produit sélectionné</div>;
    }

    return (
        <div className="mx-4 my-8 p-4 border rounded-lg">
            <h3 className="mb-6 text-lg font-semibold text-center">Ajouter des images à {product.title}</h3>

            <div className="space-y-4">
                {images.map((image, index) => (
                    <ImageField key={index} image={image} index={index} showRemove={images.length > 1} onRemove={handleRemoveImageField} onChange={handleImageChange} />
                ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-6">
                <Button onClick={handleAddImageField} variant="outline" className="w-full max-w-xs">
                    <Plus size={16} className="mr-2" />
                    Ajouter un autre champ d'image
                </Button>

                <Button onClick={handleAddImages} disabled={!canAddImages || loading} className="w-full max-w-xs">
                    {loading ? (
                        <>
                            <Spinner className="mr-2" />
                            Ajout en cours...
                        </>
                    ) : (
                        `Ajouter ${images.length} image${images.length > 1 ? "s" : ""}`
                    )}
                </Button>
            </div>
        </div>
    );
}

// Composant séparé pour les champs d'image (optimisation des re-rendus)
interface ImageFieldProps {
    image: IAddImageParams;
    index: number;
    showRemove: boolean;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof IAddImageParams, value: string) => void;
}

function ImageField({ image, index, showRemove, onRemove, onChange }: ImageFieldProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleRemove = useCallback(() => {
        onRemove(index);
    }, [onRemove, index]);

    const handleUrlChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const url = e.target.value;
            onChange(index, "url", url);
            // Reset image states when URL changes
            setImageLoaded(false);
            setImageError(false);
        },
        [onChange, index]
    );

    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(index, "name", e.target.value);
        },
        [onChange, index]
    );

    const handleAltTextChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(index, "altText", e.target.value);
        },
        [onChange, index]
    );

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);
    }, []);

    const handleImageError = useCallback(() => {
        setImageLoaded(false);
        setImageError(true);
    }, []);

    const isValidUrl = useMemo(() => {
        if (!image.url) return false;
        try {
            new URL(image.url);
            return true;
        } catch {
            return false;
        }
    }, [image.url]);

    return (
        <div className="relative p-4 border rounded-md bg-gray-50">
            {showRemove && (
                <button type="button" onClick={handleRemove} className="cursor-pointer absolute right-0 top-0 p-1 rounded-full hover:bg-gray-200 transition-colors z-10" aria-label={`Supprimer l'image ${index + 1}`}>
                    <X size={16} />
                </button>
            )}

            <div className="flex gap-4">
                {/* Miniature de l'image */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-white overflow-hidden">
                        {isValidUrl ? (
                            <>
                                {!imageError && <img src={image.url} alt={image.altText || "Aperçu"} className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`} onLoad={handleImageLoad} onError={handleImageError} />}
                                {!imageLoaded && !imageError && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                {imageError && (
                                    <div className="flex flex-col items-center text-gray-400 text-xs">
                                        <X size={16} />
                                        <span>Erreur</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <ImageIcon size={24} className="text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Champs de saisie */}
                <div className="flex-1 grid gap-3">
                    <div>
                        <Input value={image.url} onChange={handleUrlChange} placeholder="URL de l'image *" required className={imageError ? "border-red-300 focus:border-red-500" : ""} />
                        {imageError && <p className="text-xs text-red-500 mt-1">Impossible de charger l'image depuis cette URL</p>}
                    </div>
                    <Input value={image.name} onChange={handleNameChange} placeholder="Nom de l'image *" required />
                    <Input value={image.altText} onChange={handleAltTextChange} placeholder="Texte alternatif (optionnel)" />
                </div>
            </div>

            {/* Indicateur de statut */}
            {image.url && (
                <div className="mt-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${imageError ? "bg-red-500" : imageLoaded ? "bg-green-500" : "bg-yellow-500"}`} />
                    <span className="text-xs text-gray-600">{imageError ? "URL invalide" : imageLoaded ? "Image chargée" : "Chargement..."}</span>
                </div>
            )}
        </div>
    );
}
