'use client';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import CreateExtensionDialog from './CreateExtensionDialog';

const POKEMON_CARTES_DOMAIN = 'toupies-beyblade.myshopify.com';

export default function HeaderCollection() {
    const { searchTerm, setSearchTerm, openDialog, shopifyBoutique } = useShopifyStore();
    const [extensionOpen, setExtensionOpen] = useState(false);

    const isPokemonCartes = shopifyBoutique?.domain === POKEMON_CARTES_DOMAIN;

    return (
        <>
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher une collection..." className="flex-1" />

            {isPokemonCartes && (
                <Button
                    variant="outline"
                    onClick={() => setExtensionOpen(true)}
                    aria-label="Créer une extension"
                    title="Créer une extension (collection automatisée par balise)"
                    className="gap-2"
                >
                    <Sparkles size={16} />
                    Créer une extension
                </Button>
            )}

            <Button onClick={() => openDialog(5)} aria-label="Ajouter une collection" className="p-2" title="Ajouter une collection">
                <Plus size={16} />
            </Button>

            {isPokemonCartes && <CreateExtensionDialog open={extensionOpen} onOpenChange={setExtensionOpen} />}
        </>
    );
}
