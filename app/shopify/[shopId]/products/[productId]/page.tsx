'use client';
import EditeurHtml from '@/components/editeurHtml/Editeur';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { boutiques } from '@/params/paramsShopify';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// === COMPOSANTS DE LA PAGE PRODUIT ===
// Header
import HeaderProduct from './Header/HeaderProduct';
import HeaderEditeur from './Header/HeaderEditeur';

// Médias
import ImagesProduct from './images/Images';
import AddFromAsin from './images/AddFromAsin';
import Video from './Metafields/Video';

// Statut & Publication
import Statut from './Statut';
import Canaux from './Canaux';

// Prix & Variante
import Prices from './variant/Prices/Prices';
import Sku from './variant/Sku';
import VariantClient from './VariantClient';

// Organisation
import Collections from './Collections';
import TagsShopify from './Tags/Tags';

// SEO
import MetaSeo from './Metafields/MetaSeo';

// Amazon & Précommande
import Metafields from './Metafields/Metafields';

// Informations
import AboutProduct from './AboutProduct';
import LooxReviews from './Metafields/LooxReviews';
import MetafieldToClean from './Metafields/MetafieldToClean';

/**
 * Page principale d'un produit Shopify
 * 
 * Structure de la page:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    HEADER (sticky)                       │
 * │   Titre, liens autres boutiques, actions                │
 * ├───────────────────────────┬─────────────────────────────┤
 * │    COLONNE GAUCHE         │      COLONNE DROITE         │
 * │    (Médias & Contenu)     │      (Configuration)        │
 * │                           │                             │
 * │  • Description HTML       │  • Statut & Publication     │
 * │  • Images + Ajout         │  • Prix & Stock             │
 * │  • Vidéo                  │  • Organisation (Type,      │
 * │                           │    Collections, Tags)       │
 * │                           │  • SEO                      │
 * │                           │  • Amazon & Précommande     │
 * │                           │  • Informations             │
 * │                           │  • Avis & Autres            │
 * └───────────────────────────┴─────────────────────────────┘
 */
export default function Page() {
    const { setMySpinner, shopifyBoutique, product, setShopifyBoutique } = useShopifyStore();
    const query = useSearchParams();

    // Initialisation de la boutique par défaut si nécessaire
    useEffect(() => {
        if (!shopifyBoutique && query.size === 0) {
            setShopifyBoutique(boutiques[0]);
        }
    }, [shopifyBoutique, setShopifyBoutique, query.size]);

    // Désactiver le spinner une fois le produit chargé
    useEffect(() => {
        if (product && shopifyBoutique) {
            setMySpinner(false);
        }
    }, [product, shopifyBoutique, setMySpinner]);

    // Early return si pas de données
    if (!product || !shopifyBoutique) return null;

    return (
        <div className="@container/main flex flex-1 flex-col">
            {/* ===== HEADER STICKY ===== */}
            <HeaderProduct />

            {/* ===== CONTENU PRINCIPAL ===== */}
            <div className="flex flex-col lg:flex-row gap-6 p-4">
                
                {/* ===== COLONNE GAUCHE - MÉDIAS & CONTENU ===== */}
                <section className="flex-1 flex flex-col gap-5 lg:max-w-[50%]">
                    {/* Description HTML avec Éditeur */}
                    <EditeurHtml html={product.descriptionHtml}>
                        <HeaderEditeur />
                    </EditeurHtml>

                    {/* Galerie d'images avec outils d'ajout */}
                    <ImagesProduct />

                    {/* Import depuis ASIN Amazon */}
                    <AddFromAsin />

                    {/* Vidéo du produit */}
                    <Video />
                </section>

                {/* ===== COLONNE DROITE - CONFIGURATION ===== */}
                <aside className="flex-1 flex flex-col gap-4 lg:max-w-[50%]">
                    
                    {/* --- SECTION: Statut & Publication --- */}
                    <div className="space-y-4">
                        <Statut />
                        <Canaux product={product} />
                    </div>

                    {/* --- SECTION: Prix & Stock --- */}
                    <div className="space-y-4">
                        <Prices />
                        <Sku />
                        <VariantClient />
                    </div>

                    {/* --- SECTION: Organisation --- */}
                    <div className="space-y-4">
                        <Collections />
                        <TagsShopify />
                    </div>

                    {/* --- SECTION: SEO --- */}
                    <MetaSeo />

                    {/* --- SECTION: Amazon & Précommande --- */}
                    <Metafields />

                    {/* --- SECTION: Informations & Autres --- */}
                    <div className="space-y-4">
                        <LooxReviews metafields={product.metafields.nodes} />
                        <MetafieldToClean />
                    </div>
                </aside>
            </div>
        </div>
    );
}
