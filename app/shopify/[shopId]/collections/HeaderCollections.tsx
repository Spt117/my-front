import useShopifyStore from '@/components/shopify/shopifyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export default function HeaderCollection() {
    const { searchTerm, setSearchTerm, openDialog } = useShopifyStore();

    return (
        <>
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher une collection..." className="flex-1" />

            <Button onClick={() => openDialog(5)} aria-label="Ajouter une collection" className="p-2" title="Ajouter une collection">
                <Plus size={16} />
            </Button>
        </>
    );
}
