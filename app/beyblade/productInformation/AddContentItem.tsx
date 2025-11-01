"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus } from "lucide-react";
import { useState } from "react";
import useBeybladeStore from "../beybladeStore";
import { IProductContentItem, TBeybladeProductTypeContent, typeBeybladeProductContent } from "../model/typesBeyblade";

export default function AddContentItem() {
    const [contentForm, setContentForm] = useState<Partial<IProductContentItem>>({
        type: undefined,
        name: "",
        notes: "",
    });
    const { beybladeProduct, addContentItem } = useBeybladeStore();

    const existingItems = beybladeProduct?.content || [];
    const handleAddContent = () => {
        if (contentForm.type && contentForm.name) {
            const newItem: IProductContentItem = {
                type: contentForm.type,
                name: contentForm.name,
                notes: contentForm.notes || undefined,
            };
            addContentItem(newItem);
            // Reset form
            setContentForm({
                type: undefined,
                name: "",
                notes: "",
            });
        }
    };

    const isFormValid = contentForm.type && contentForm.name;

    // Helper pour capitaliser le type
    const capitalizeType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Add Product Content
                </CardTitle>
                <CardDescription>Link beyblades, launchers, arenas, or accessories to this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="content-type">Content Type *</Label>
                        <Select
                            value={contentForm.type || ""}
                            onValueChange={(v) => setContentForm((prev) => ({ ...prev, type: v as TBeybladeProductTypeContent }))}
                        >
                            <SelectTrigger id="content-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeBeybladeProductContent.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {capitalizeType(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content-name">Name *</Label>
                        <Input
                            id="content-name"
                            value={contentForm.name}
                            onChange={(e) => setContentForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Dran Buster 3-60F"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content-notes">Notes (Optional)</Label>
                    <Textarea
                        id="content-notes"
                        value={contentForm.notes}
                        onChange={(e) => setContentForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="e.g., Special color, Tournament edition, Recolor..."
                        rows={3}
                    />
                </div>

                <Button onClick={handleAddContent} disabled={!isFormValid} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Content Item
                </Button>

                {existingItems.length > 0 && (
                    <div className="mt-6 space-y-2">
                        <Label className="text-sm font-medium">Added Items ({existingItems.length})</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {existingItems.map((item, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                                    {capitalizeType(item.type)}
                                                </span>
                                                <span className="font-medium text-sm truncate">{item.name}</span>
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
