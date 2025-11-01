import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import useBeybladeStore from "./beybladeStore";

export default function Preview() {
    const { beybladeProduct } = useBeybladeStore();

    return (
        <TabsContent value="preview" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Preview</CardTitle>
                    <CardDescription>Review your product before saving</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Product Type</Label>
                        <p className="font-medium">{beybladeProduct?.product || "—"}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Title</Label>
                        <p className="font-medium">{beybladeProduct?.title || "—"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Brand</Label>
                            <p className="font-medium">{beybladeProduct?.brand || "—"}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Product Code</Label>
                            <p className="font-medium">{beybladeProduct?.productCode || "—"}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Images</Label>
                        <p className="font-medium">{beybladeProduct?.images?.length || 0} image(s)</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Content Items</Label>
                        <p className="font-medium">{beybladeProduct?.content?.length || 0} item(s)</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
