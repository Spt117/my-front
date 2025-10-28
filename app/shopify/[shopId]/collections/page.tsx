"use client";

import MySpinner from "@/components/layout/my-spinner";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CollectionRow from "./Collection";
import useCollectionStore from "./storeCollections";

export default function Page() {
    const params = useSearchParams();
    const { shopifyBoutique, searchTerm } = useShopifyStore();
    const { filteredCollections, setFilteredCollections, loadingCollection } = useCollectionStore();

    // État pour le tri
    const [sortBy, setSortBy] = useState<"title" | "created_at" | "updated_at">("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        if (searchTerm) {
            const filtered = filteredCollections.filter(
                (collection) =>
                    collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    collection.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    collection.id.toString().includes(searchTerm)
            );
            setFilteredCollections(filtered);
        }
    }, [searchTerm, shopifyBoutique, params]);

    // Tri des collections
    const sortedCollections = useMemo(() => {
        return [...filteredCollections].sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case "title":
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                case "created_at":
                    aValue = new Date(a.events.nodes[0]?.createdAt);
                    bValue = new Date(b.events.nodes[0]?.createdAt);
                    break;
                case "updated_at":
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
                default:
                    return 0;
            }
            return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        });
    }, [filteredCollections, sortBy, sortDirection]);

    const toggleSortDirection = () => {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    if (loadingCollection) {
        return <MySpinner active={true} />;
    }

    if (sortedCollections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-lg">Aucune collection trouvée.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
                <Badge variant="secondary" className="text-sm">
                    {sortedCollections.length}
                </Badge>
            </div>
            {/* Composant de tri */}
            <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trier par..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="title">Titre</SelectItem>
                        <SelectItem value="created_at">Date de création</SelectItem>
                        <SelectItem value="updated_at">Date de mise à jour</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={toggleSortDirection}>
                    {sortDirection === "asc" ? <ArrowUpDown className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    <span className="sr-only">Inverser le tri</span>
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">Sélection</TableHead>
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead>Titre</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Handle</TableHead>
                            <TableHead className="w-32 text-right">ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCollections.map((collection) => (
                            <CollectionRow key={collection.id} collection={collection} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
