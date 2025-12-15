import { ILauncher, launcherTypes, rotationDirections } from '@/app/oldBeyblade/model/typesBeyblade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ImageManager from '../ImageManager';

export default function Launcher() {
    const [launcherForm, setLauncherForm] = useState<Partial<ILauncher>>({
        productCode: '',
        type: undefined,
        system: '',
        color: '',
        rotationDirection: undefined,
        images: [],
    });

    const handleAddLauncher = () => {
        if (launcherForm.productCode && launcherForm.type && launcherForm.system && launcherForm.color && launcherForm.rotationDirection) {
            const launcher: ILauncher = {
                productCode: launcherForm.productCode,
                type: launcherForm.type,
                system: launcherForm.system,
                color: launcherForm.color,
                rotationDirection: launcherForm.rotationDirection,
                images: [],
            };
            setLauncherForm({
                productCode: '',
                type: undefined,
                system: '',
                color: '',
                rotationDirection: undefined,
                images: [],
            });
        }
    };

    return (
        <TabsContent value="launcher" className="space-y-4 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Launcher</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Product Code *</Label>
                            <Input value={launcherForm.productCode} onChange={(e) => setLauncherForm((prev) => ({ ...prev, productCode: e.target.value }))} placeholder="BX-L01" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select value={launcherForm.type} onValueChange={(v) => setLauncherForm((prev) => ({ ...prev, type: v as any }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {launcherTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>System *</Label>
                            <Input value={launcherForm.system} onChange={(e) => setLauncherForm((prev) => ({ ...prev, system: e.target.value }))} placeholder="X" />
                        </div>
                        <div className="space-y-2">
                            <Label>Color *</Label>
                            <Input value={launcherForm.color} onChange={(e) => setLauncherForm((prev) => ({ ...prev, color: e.target.value }))} placeholder="Blue" />
                        </div>
                        <div className="space-y-2">
                            <Label>Rotation *</Label>
                            <Select value={launcherForm.rotationDirection} onValueChange={(v) => setLauncherForm((prev) => ({ ...prev, rotationDirection: v as any }))}>
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
                    </div>
                    <ImageManager
                        images={launcherForm.images || []}
                        onAddImage={(url) =>
                            setLauncherForm((prev) => ({
                                ...prev,
                                images: [...(prev.images || []), url],
                            }))
                        }
                        onRemoveImage={(index) =>
                            setLauncherForm((prev) => ({
                                ...prev,
                                images: prev.images?.filter((_, i) => i !== index) || [],
                            }))
                        }
                        title="Launcher Images"
                        description="Add images of this launcher"
                        emptyMessage="No launcher images yet"
                    />
                    <Button onClick={handleAddLauncher} className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        Add Launcher
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
