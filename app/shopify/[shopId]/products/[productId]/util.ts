/**
 * Classes CSS réutilisables pour la page produit
 */

// Style des cartes principales
export const cssCard = "shadow-md border border-gray-200 bg-white rounded-lg transition-shadow hover:shadow-lg";

// Style pour les éléments cliquables (copie)
export const classCopy = "cursor-pointer transition-transform duration-150 ease-out active:scale-95 hover:bg-gray-100";

// Types des champs de variante
const fieldsVariant = ["price", "compareAtPrice", "barcode", "sku", "weight", "weightUnit"] as const;
export type TFieldVariant = (typeof fieldsVariant)[number];

// Types des champs de produit
const fieldsProduct = ["title", "descriptionHtml", "Statut", "Delete", "Handle", "type"] as const;
export type TFieldProduct = (typeof fieldsProduct)[number];

// Type pour les canaux de vente
export type TCanal = { id: string; isPublished: boolean; name: string };

