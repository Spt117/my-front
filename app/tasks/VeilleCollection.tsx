"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addWebsiteToVeille } from "@/library/models/veille/middlewareVeille";
import { TVeille } from "@/library/models/veille/veilleType";
import { boutiques } from "@/library/params/paramsShopify";
import { sitesWordpress } from "@/library/params/paramsWordpress";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MultiSelect, MultiSelectOption } from "../../components/Multiselect";
import { Save, Globe, Search, Tag, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function VeilleCollection({ collection }: { collection: TVeille }) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const domainsShopify = boutiques.map((b) => b.publicDomain);
    const domainsWordpress = sitesWordpress.map((s) => s.domain);
    const allDomains = [...domainsShopify, ...domainsWordpress];

    const options = allDomains.map((domain) => ({
        label: domain,
        value: domain,
    })) as MultiSelectOption[];

    const handleSelectDest = (selectedOptions: string[]) => {
        setSelectedOptions(selectedOptions);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await addWebsiteToVeille(collection._id!, selectedOptions);
            toast.success("Websites updated successfully");
        } catch (error) {
            toast.error("Failed to update websites");
        } finally {
            setIsSaving(false);
        }
    };

    function arraysHaveDifferences(): boolean {
        const arr1 = collection.website || [];
        const arr2 = selectedOptions;
        if (arr1.length !== arr2.length) return true;

        const set1 = new Set(arr1);
        const set2 = new Set(arr2);

        return set1.size !== set2.size || [...set1].some((item) => !set2.has(item));
    }

    useEffect(() => {
        setSelectedOptions(collection.website || []);
    }, [collection.website]);

    const formatDate = (date: Date | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300 m-2">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            {collection.searchTerm}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">ID: {collection._id}</CardDescription>
                    </div>
                    <Badge variant={collection.active ? "default" : "secondary"}>
                        {collection.active ? "Active" : "Inactive"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Brand:</span>
                            <span className="text-muted-foreground">{collection.brand || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Marketplace:</span>
                            <span className="text-muted-foreground">{collection.marketplace || "N/A"}</span>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Created:</span>
                            <span className="text-muted-foreground">{formatDate(collection.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Updated:</span>
                            <span className="text-muted-foreground">{formatDate(collection.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Monitored Websites
                    </label>
                    <MultiSelect
                        disabled={!collection.active}
                        defaultValue={collection.website || []}
                        options={options}
                        onValueChange={handleSelectDest}
                        placeholder="Select websites to check..."
                        maxCount={3}
                        className="w-full"
                    />
                    {collection.website && collection.website.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Currently checking {collection.website.length} website{collection.website.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
                <Button disabled={!arraysHaveDifferences() || isSaving} onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );
}
