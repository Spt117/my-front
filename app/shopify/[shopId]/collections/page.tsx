'use client';

import MySpinner from '@/components/layout/my-spinner';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import CollectionRow from './Collection';
import useCollectionStore from './storeCollections';

export default function Page() {
    const params = useSearchParams();
    const { shopifyBoutique, searchTerm } = useShopifyStore();
    const { filteredCollections, setFilteredCollections, loadingCollection } = useCollectionStore();

    // État pour le tri
    const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'updated_at'>('title');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                case 'created_at':
                    aValue = new Date(a.events.nodes[0]?.createdAt);
                    bValue = new Date(b.events.nodes[0]?.createdAt);
                    break;
                case 'updated_at':
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
                default:
                    return 0;
            }
            return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        });
    }, [filteredCollections, sortBy, sortDirection]);

    const toggleSortDirection = () => {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Collections</h2>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 text-sm font-semibold rounded-full">
                        {sortedCollections.length} total
                    </Badge>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trier par</span>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                            <SelectTrigger className="w-[160px] border-none shadow-none focus:ring-0 bg-transparent font-medium text-slate-700 h-8">
                                <SelectValue placeholder="Trier par..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-100 shadow-lg">
                                <SelectItem value="title" className="focus:bg-slate-50">
                                    Titre
                                </SelectItem>
                                <SelectItem value="created_at" className="focus:bg-slate-50">
                                    Date de création
                                </SelectItem>
                                <SelectItem value="updated_at" className="focus:bg-slate-50">
                                    Date de mise à jour
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="ghost" size="sm" onClick={toggleSortDirection} className="h-9 w-9 p-0 hover:bg-slate-50 text-slate-500 rounded-lg transition-all">
                        {sortDirection === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        <span className="sr-only">Inverser le tri</span>
                    </Button>
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-200">
                            <TableHead className="w-12 text-center text-slate-500 font-bold uppercase tracking-wider text-[10px]">Sel</TableHead>
                            <TableHead className="w-16 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Image</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Titre</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Type</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Handle</TableHead>
                            <TableHead className="w-32 text-right text-slate-500 font-bold uppercase tracking-wider text-[10px]">ID</TableHead>
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
