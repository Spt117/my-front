import { beybladeTypes, IBeyblade, rotationDirections } from '@/app/oldBeyblade/model/typesBeyblade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ImageManager from '../ImageManager';

export default function Beyblade() {
    const [beybladeForm, setBeybladeForm] = useState<Partial<IBeyblade>>({
        productCode: '',
        name: '',
        rotationDirection: undefined,
        type: undefined,
        system: '',
        weight: undefined,
        parts: {
            blade: '',
            ratchet: '',
            bit: '',
        },
        images: [],
    });

    const handleAddBeyblade = () => {
        if (beybladeForm.name && beybladeForm.productCode && beybladeForm.rotationDirection && beybladeForm.type && beybladeForm.parts) {
            const beyblade: IBeyblade = {
                productCode: beybladeForm.productCode,
                name: beybladeForm.name,
                rotationDirection: beybladeForm.rotationDirection,
                type: beybladeForm.type,
                system: beybladeForm.system || '',
                weight: beybladeForm.weight,
                parts: beybladeForm.parts,
                images: [],
            };
            setBeybladeForm({
                productCode: '',
                name: '',
                rotationDirection: undefined,
                type: undefined,
                system: '',
                weight: undefined,
                parts: {
                    blade: '',
                    ratchet: '',
                    bit: '',
                },
                images: [],
            });
        }
    };

    const handleAddBeybladeImage = (imageUrl: string) => {
        setBeybladeForm((prev) => ({
            ...prev,
            images: [...(prev.images || []), imageUrl],
        }));
    };

    const handleRemoveBeybladeImage = (index: number) => {
        setBeybladeForm((prev) => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index) || [],
        }));
    };
    return (
        <TabsContent value="beyblade" className="space-y-4 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Beyblade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Product Code *</Label>
                            <Input value={beybladeForm.productCode} onChange={(e) => setBeybladeForm((prev) => ({ ...prev, productCode: e.target.value }))} placeholder="BX-01" />
                        </div>
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={beybladeForm.name} onChange={(e) => setBeybladeForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Dran Buster" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Rotation *</Label>
                            <Select value={beybladeForm.rotationDirection} onValueChange={(v) => setBeybladeForm((prev) => ({ ...prev, rotationDirection: v as any }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rotationDirections.map((dir) => (
                                        <SelectItem key={dir} value={dir}>
                                            {dir}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select value={beybladeForm.type} onValueChange={(v) => setBeybladeForm((prev) => ({ ...prev, type: v as any }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {beybladeTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>System</Label>
                            <Input value={beybladeForm.system} onChange={(e) => setBeybladeForm((prev) => ({ ...prev, system: e.target.value }))} placeholder="X" />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Weight (g)</Label>
                            <Input
                                type="number"
                                value={beybladeForm.weight || ''}
                                onChange={(e) =>
                                    setBeybladeForm((prev) => ({
                                        ...prev,
                                        weight: e.target.value ? parseFloat(e.target.value) : undefined,
                                    }))
                                }
                                placeholder="32.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Blade *</Label>
                            <Input
                                value={typeof beybladeForm.parts?.blade === 'string' ? beybladeForm.parts?.blade : ''}
                                onChange={(e) =>
                                    setBeybladeForm((prev) => ({
                                        ...prev,
                                        parts: { ...prev.parts!, blade: e.target.value },
                                    }))
                                }
                                placeholder="Dran Buster"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ratchet *</Label>
                            <Input
                                value={typeof beybladeForm.parts?.ratchet === 'string' ? beybladeForm.parts?.ratchet : ''}
                                onChange={(e) =>
                                    setBeybladeForm((prev) => ({
                                        ...prev,
                                        parts: { ...prev.parts!, ratchet: e.target.value },
                                    }))
                                }
                                placeholder="3-60"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Bit *</Label>
                            <Input
                                value={typeof beybladeForm.parts?.bit === 'string' ? beybladeForm.parts?.bit : ''}
                                onChange={(e) =>
                                    setBeybladeForm((prev) => ({
                                        ...prev,
                                        parts: { ...prev.parts!, bit: e.target.value },
                                    }))
                                }
                                placeholder="F"
                            />
                        </div>
                    </div>
                    <ImageManager
                        images={beybladeForm.images || []}
                        onAddImage={handleAddBeybladeImage}
                        onRemoveImage={handleRemoveBeybladeImage}
                        title="Beyblade Images"
                        description="Add images of this beyblade"
                        emptyMessage="No beyblade images yet"
                        maxImages={5} // Optionnel : limite le nombre d'images
                    />

                    <Button onClick={handleAddBeyblade} className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        Add Beyblade
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
