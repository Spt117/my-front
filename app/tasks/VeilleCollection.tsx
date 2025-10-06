"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addWebsiteToVeille } from "@/library/models/veille/middlewareVeille";
import { TVeille } from "@/library/models/veille/veilleType";
import { boutiques } from "@/library/params/paramsShopify";
import { sitesWordpress } from "@/library/params/paramsWordpress";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { MultiSelect, MultiSelectOption, MultiSelectRef } from "../product-duplicate/Multiselect";

export default function VeilleCollection({ collection }: { collection: TVeille }) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const multiSelectRef = React.useRef<MultiSelectRef>(null);

    const domainsShopify = boutiques.map((b) => b.publicDomain);
    const domainsWordpress = sitesWordpress.map((s) => s.domain);
    const allDomains = [...domainsShopify, ...domainsWordpress];

    const handleReset = () => {
        multiSelectRef.current?.reset(); // Remet les defaultValue
    };

    const options = allDomains.map((domain) => ({
        label: domain,
        value: domain,
    })) as unknown as MultiSelectOption[];

    const handleSelectDest = (selectedOptions: string[]) => {
        setSelectedOptions(selectedOptions);
    };

    const handleSave = async () => {
        const res = await addWebsiteToVeille(collection._id!, selectedOptions);
        toast.success("Websites updated " + JSON.stringify(res));
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
        console.log("Collection websites:", collection.website);
        console.log("Selected options before set:", selectedOptions);
        setSelectedOptions(collection.website || []);
    }, [collection.website]);

    return (
        <Card key={collection._id} style={{ margin: "10px", padding: "10px" }}>
            <p>ID: {collection._id}</p>
            <p>User: {collection.user}</p>
            <p>Search Term: {collection.searchTerm}</p>
            <p>Brand: {collection.brand}</p>
            <p>Marketplace: {collection.marketplace}</p>
            <p>Active: {collection.active ? "Yes" : "No"}</p>
            <p>Websites: {collection.website?.join(", ")}</p>
            <p>Created At: {collection.createdAt?.toString()}</p>
            <p>Updated At: {collection.updatedAt?.toString()}</p>
            <MultiSelect
                defaultValue={collection.website || []}
                options={options}
                onValueChange={handleSelectDest}
                placeholder="Select websites..."
            />
            <Button disabled={!arraysHaveDifferences()} onClick={handleSave} style={{ marginTop: "10px" }}>
                Save Websites
            </Button>
        </Card>
    );
}
