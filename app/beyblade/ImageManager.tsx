import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Upload, X } from "lucide-react";
import { useState } from "react";

interface ImageManagerProps {
    images: string[];
    onAddImage: (imageUrl: string) => void;
    onRemoveImage: (index: number) => void;
    title?: string;
    description?: string;
    emptyMessage?: string;
    maxImages?: number;
    className?: string;
}

export default function ImageManager({
    images,
    onAddImage,
    onRemoveImage,
    title = "Images",
    description = "Add images",
    emptyMessage = "No images added yet",
    maxImages,
    className = "",
}: ImageManagerProps) {
    const [imageUrl, setImageUrl] = useState("");

    const handleAddImage = () => {
        if (imageUrl.trim() && (!maxImages || images.length < maxImages)) {
            onAddImage(imageUrl);
            setImageUrl("");
        }
    };

    const canAddMore = !maxImages || images.length < maxImages;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                    {maxImages && ` (${images.length}/${maxImages})`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {canAddMore && (
                    <div className="flex gap-2">
                        <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                            onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                        />
                        <Button onClick={handleAddImage} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add
                        </Button>
                    </div>
                )}

                {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
                                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onRemoveImage(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{emptyMessage}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
