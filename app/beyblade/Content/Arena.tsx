import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { IArena } from "@/app/beyblade/model/typesBeyblade";
import { Plus } from "lucide-react";
import { useState } from "react";
import ImageManager from "../ImageManager";

export default function Arena() {
    const [arenaForm, setArenaForm] = useState<Partial<IArena>>({
        productCode: "",
        color: "",
        system: "",
        diameter: undefined,
        gimmick: "",
        images: [],
    });

    const handleAddArena = () => {
        if (arenaForm.productCode && arenaForm.color && arenaForm.system) {
            const arena: IArena = {
                productCode: arenaForm.productCode,
                color: arenaForm.color,
                system: arenaForm.system,
                diameter: arenaForm.diameter,
                gimmick: arenaForm.gimmick,
                images: [],
            };
            setArenaForm({
                productCode: "",
                color: "",
                system: "",
                diameter: undefined,
                gimmick: "",
                images: [],
            });
        }
    };
    return (
        <TabsContent value="arena" className="space-y-4 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Arena</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Product Code *</Label>
                            <Input
                                value={arenaForm.productCode}
                                onChange={(e) => setArenaForm((prev) => ({ ...prev, productCode: e.target.value }))}
                                placeholder="BX-S01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color *</Label>
                            <Input
                                value={arenaForm.color}
                                onChange={(e) => setArenaForm((prev) => ({ ...prev, color: e.target.value }))}
                                placeholder="Red"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>System *</Label>
                            <Input
                                value={arenaForm.system}
                                onChange={(e) => setArenaForm((prev) => ({ ...prev, system: e.target.value }))}
                                placeholder="X"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Diameter (cm)</Label>
                            <Input
                                type="number"
                                value={arenaForm.diameter || ""}
                                onChange={(e) =>
                                    setArenaForm((prev) => ({
                                        ...prev,
                                        diameter: e.target.value ? parseFloat(e.target.value) : undefined,
                                    }))
                                }
                                placeholder="45"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gimmick</Label>
                            <Input
                                value={arenaForm.gimmick}
                                onChange={(e) => setArenaForm((prev) => ({ ...prev, gimmick: e.target.value }))}
                                placeholder="X-treme"
                            />
                        </div>
                    </div>
                    <ImageManager
                        images={arenaForm.images || []}
                        onAddImage={(url) =>
                            setArenaForm((prev) => ({
                                ...prev,
                                images: [...(prev.images || []), url],
                            }))
                        }
                        onRemoveImage={(index) =>
                            setArenaForm((prev) => ({
                                ...prev,
                                images: prev.images?.filter((_, i) => i !== index) || [],
                            }))
                        }
                        title="Arena Images"
                        description="Add images of this arena"
                        emptyMessage="No arena images yet"
                    />
                    <Button onClick={handleAddArena} className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        Add Arena
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
