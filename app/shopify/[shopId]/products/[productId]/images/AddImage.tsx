"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { postServer } from "@/library/utils/fetchServer";
import { X, Plus, ImageIcon, Upload, Link2 } from "lucide-react";
import { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

interface IAddImageParams {
    url: string;
    name: string;
    altText: string;
}

interface IFileUpload {
    file: File;
    name: string;
    altText: string;
    preview: string;
}

const EMPTY_IMAGE: IAddImageParams = { url: "", name: "", altText: "" };

type TabType = "url" | "file";

export default function AddImage() {
    const { product, shopifyBoutique, setProduct } = useShopifyStore();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<IAddImageParams[]>([EMPTY_IMAGE]);
    const [files, setFiles] = useState<IFileUpload[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("url");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mémoisation pour éviter les re-rendus inutiles
    const canAddImages = useMemo(() => {
        return Boolean(shopifyBoutique && product && images.every((img) => img.url.trim() && img.name.trim()));
    }, [shopifyBoutique, product, images]);

    const canUploadFiles = useMemo(() => {
        return Boolean(shopifyBoutique && product && files.length > 0 && files.every((f) => f.name.trim()));
    }, [shopifyBoutique, product, files]);

    // Callbacks pour les URLs
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
            const validImages = images
                .filter((img) => img.url.trim() && img.name.trim())
                .map((img) => ({
                    url: img.url.trim(),
                    name: img.name.trim(),
                    altText: img.altText.trim(),
                }));

            await Promise.allSettled(
                validImages.map((image) =>
                    postServer("http://localhost:9100/shopify/add-image", {
                        domain: shopifyBoutique!.domain,
                        productId: product!.id,
                        image,
                    })
                )
            );
            toast.success(`${validImages.length} image(s) ajoutée(s) avec succès !`);
            setImages([{ ...EMPTY_IMAGE }]);
        } catch (error) {
            console.error("Erreur lors de l'ajout des images:", error);
            toast.error("Erreur lors de l'ajout des images");
        } finally {
            setLoading(false);
        }
    }, [canAddImages, images, shopifyBoutique, product, setProduct]);

    // Callbacks pour les fichiers
    const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles: IFileUpload[] = Array.from(selectedFiles)
            .filter((file) => file.type.startsWith("image/"))
            .map((file) => ({
                file,
                name: file.name.replace(/\.[^/.]+$/, ""), // Enlever l'extension
                altText: "",
                preview: URL.createObjectURL(file),
            }));

        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleRemoveFile = useCallback((index: number) => {
        setFiles((prev) => {
            const fileToRemove = prev[index];
            URL.revokeObjectURL(fileToRemove.preview);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const handleFileChange = useCallback((index: number, field: "name" | "altText", value: string) => {
        setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], [field]: value };
            return newFiles;
        });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect]
    );

    const handleUploadFiles = useCallback(async () => {
        if (!canUploadFiles || !product || !shopifyBoutique) return;

        setLoading(true);

        try {
            const results = await Promise.allSettled(
                files.map(async (fileData) => {
                    return new Promise<void>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = async () => {
                            try {
                                const base64Data = reader.result as string;
                                const res = await postServer("http://localhost:9100/shopify/add-image-base64", {
                                    domain: shopifyBoutique.domain,
                                    productId: product.id,
                                    base64Data,
                                    filename: fileData.name,
                                    altText: fileData.altText,
                                });
                                if (res.error) reject(new Error(res.error));
                                else resolve();
                            } catch (err) {
                                reject(err);
                            }
                        };
                        reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
                        reader.readAsDataURL(fileData.file);
                    });
                })
            );

            const successes = results.filter((r) => r.status === "fulfilled").length;
            const failures = results.filter((r) => r.status === "rejected").length;

            if (successes > 0) toast.success(`${successes} image(s) uploadée(s) avec succès !`);
            if (failures > 0) toast.error(`${failures} image(s) n'ont pas pu être uploadées`);

            // Nettoyer les previews et réinitialiser
            files.forEach((f) => URL.revokeObjectURL(f.preview));
            setFiles([]);
        } catch (error) {
            console.error("Erreur lors de l'upload des fichiers:", error);
            toast.error("Erreur lors de l'upload des fichiers");
        } finally {
            setLoading(false);
        }
    }, [canUploadFiles, files, shopifyBoutique, product]);

    if (!product) {
        return <div className="mx-4 my-8 p-4 border rounded-lg text-center text-gray-500">Aucun produit sélectionné</div>;
    }

    return (
        <div className="mx-4 p-4 border border-gray-500 rounded-lg flex-1 h-min">
            <h3 className="mb-4 text-lg font-semibold text-center">Ajouter des images</h3>

            {/* Tabs */}
            <div className="flex mb-4 border-b">
                <button
                    onClick={() => setActiveTab("url")}
                    className={`flex items-center gap-2 px-4 py-2 -mb-px ${
                        activeTab === "url" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Link2 size={16} />
                    Via URL
                </button>
                <button
                    onClick={() => setActiveTab("file")}
                    className={`flex items-center gap-2 px-4 py-2 -mb-px ${
                        activeTab === "file" ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Upload size={16} />
                    Depuis l'ordinateur
                </button>
            </div>

            {/* Contenu URL */}
            {activeTab === "url" && (
                <>
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <Button onClick={handleAddImageField} variant="outline" className="w-full max-w-xs">
                            <Plus size={16} className="mr-2" />
                            Ajouter
                        </Button>

                        <Button onClick={handleAddImages} disabled={!canAddImages || loading} className="w-full max-w-xs">
                            {loading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Ajout en cours...
                                </>
                            ) : (
                                `Enregister ${images.length} image${images.length > 1 ? "s" : ""}`
                            )}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {images.map((image, index) => (
                            <ImageField
                                key={index}
                                image={image}
                                index={index}
                                showRemove={images.length > 1}
                                onRemove={handleRemoveImageField}
                                onChange={handleImageChange}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Contenu Fichiers */}
            {activeTab === "file" && (
                <>
                    {/* Zone de drop */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition-all ${
                            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                    >
                        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Glissez-déposez vos images ici</p>
                        <p className="text-sm text-gray-400">ou cliquez pour sélectionner</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                        />
                    </div>

                    {/* Liste des fichiers sélectionnés */}
                    {files.length > 0 && (
                        <div className="space-y-4 mb-4">
                            {files.map((fileData, index) => (
                                <FileUploadField
                                    key={index}
                                    fileData={fileData}
                                    index={index}
                                    onRemove={handleRemoveFile}
                                    onChange={handleFileChange}
                                />
                            ))}
                        </div>
                    )}

                    {/* Bouton d'upload */}
                    {files.length > 0 && (
                        <Button onClick={handleUploadFiles} disabled={!canUploadFiles || loading} className="w-full">
                            {loading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Upload en cours...
                                </>
                            ) : (
                                `Uploader ${files.length} image${files.length > 1 ? "s" : ""}`
                            )}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}

// Composant pour les fichiers uploadés
interface FileUploadFieldProps {
    fileData: IFileUpload;
    index: number;
    onRemove: (index: number) => void;
    onChange: (index: number, field: "name" | "altText", value: string) => void;
}

function FileUploadField({ fileData, index, onRemove, onChange }: FileUploadFieldProps) {
    return (
        <div className="relative p-4 border rounded-md bg-gray-50">
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="cursor-pointer absolute right-0 top-0 p-1 rounded-full hover:bg-gray-200 transition-colors z-10"
                aria-label={`Supprimer le fichier ${index + 1}`}
            >
                <X size={16} />
            </button>

            <div className="flex gap-4 flex-wrap">
                {/* Miniature */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 border-2 border-gray-300 rounded-md overflow-hidden bg-white">
                        <img src={fileData.preview} alt="Aperçu" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Champs de saisie */}
                <div className="flex-1 grid gap-3">
                    <Input value={fileData.name} onChange={(e) => onChange(index, "name", e.target.value)} placeholder="Nom de l'image *" required />
                    <Input value={fileData.altText} onChange={(e) => onChange(index, "altText", e.target.value)} placeholder="Texte alternatif (optionnel)" />
                </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
                {(fileData.file.size / 1024).toFixed(1)} Ko • {fileData.file.type}
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
                <button
                    type="button"
                    onClick={handleRemove}
                    className="cursor-pointer absolute right-0 top-0 p-1 rounded-full hover:bg-gray-200 transition-colors z-10"
                    aria-label={`Supprimer l'image ${index + 1}`}
                >
                    <X size={16} />
                </button>
            )}

            <div className="flex gap-4 flex-wrap">
                {/* Miniature de l'image */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-white overflow-hidden">
                        {isValidUrl ? (
                            <>
                                {!imageError && (
                                    <img
                                        src={image.url}
                                        alt={image.altText || "Aperçu"}
                                        className={`w-full h-full object-cover transition-opacity duration-200 ${
                                            imageLoaded ? "opacity-100" : "opacity-0"
                                        }`}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                    />
                                )}
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
                        <Input
                            value={image.url}
                            onChange={handleUrlChange}
                            placeholder="URL de l'image *"
                            required
                            className={imageError ? "border-red-300 focus:border-red-500" : ""}
                        />
                        {imageError && (
                            <p className="text-xs text-red-500 mt-1">Impossible de charger l'image depuis cette URL</p>
                        )}
                    </div>
                    <Input value={image.name} onChange={handleNameChange} placeholder="Nom de l'image *" required />
                    <Input value={image.altText} onChange={handleAltTextChange} placeholder="Texte alternatif (optionnel)" />
                </div>
            </div>

            {/* Indicateur de statut */}
            {image.url && (
                <div className="mt-3 flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            imageError ? "bg-red-500" : imageLoaded ? "bg-green-500" : "bg-yellow-500"
                        }`}
                    />
                    <span className="text-xs text-gray-600">
                        {imageError ? "URL invalide" : imageLoaded ? "Image chargée" : "Chargement..."}
                    </span>
                </div>
            )}
        </div>
    );
}
