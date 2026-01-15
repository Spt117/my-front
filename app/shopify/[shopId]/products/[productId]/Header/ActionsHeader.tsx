import useShopifyStore from "@/components/shopify/shopifyStore";
import { CopyPlusIcon, Globe, Trash2 } from "lucide-react";
import Image from "next/image";
import useProductStore from "../storeProduct";
import AmazonLink from "./AmazonLink";
import Save from "./Save";

/**
 * Actions disponibles dans le header de la page produit
 * - Sauvegarder les modifications
 * - Lien Amazon
 * - Voir sur la boutique
 * - Éditer sur Shopify Admin
 * - Dupliquer
 * - Supprimer
 */
export default function ActionsHeader() {
    const { product, shopifyBoutique, openDialog } = useShopifyStore();
    const { canauxProduct, statut } = useProductStore();

    if (!product || !shopifyBoutique) return null;

    const boolPublished = canauxProduct.find((c) => c.name === "Online Store")?.isPublished;
    const productUrl = `https://${shopifyBoutique.publicDomain}/products/${product.handle}`;

    return (
        <div className="flex gap-2 items-center mr-2">
            <Save />
            <AmazonLink />
            
            {/* Voir sur la boutique (si publié et actif) */}
            {boolPublished && statut === "ACTIVE" && (
                <a href={productUrl} target="_blank" rel="noopener noreferrer" title="Voir sur la boutique">
                    <Globe size={28} className="text-gray-600 hover:text-blue-600 transition-colors" />
                </a>
            )}
            
            {/* Éditer sur Shopify Admin */}
            <a
                href={`https://${shopifyBoutique.domain}/admin/products/${product.id.split("/").pop()}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Éditer sur Shopify"
            >
                <Image
                    src="/shopify.png"
                    alt="Shopify"
                    width={28}
                    height={28}
                    className="w-auto h-auto object-cover rounded hover:opacity-80 transition-opacity"
                />
            </a>
            
            {/* Dupliquer le produit */}
            <button 
                onClick={() => openDialog(34)} 
                title="Dupliquer le produit"
                className="cursor-pointer hover:text-blue-600 transition-colors"
            >
                <CopyPlusIcon size={28} className="text-gray-600" />
            </button>
            
            {/* Supprimer le produit */}
            <button 
                onClick={() => openDialog(2)} 
                title="Supprimer le produit"
                className="cursor-pointer hover:text-red-600 transition-colors"
            >
                <Trash2 size={26} className="text-gray-500" />
            </button>
        </div>
    );
}
