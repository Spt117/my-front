export const cssCard = "shadow-lg border border-slate-300 bg-gradient-to-br from-slate-50 to-white w-full h-min relative";
export const classCopy = "cursor-pointer transition-transform duration-150 ease-out active:scale-90 hover:scale-105";

const fieldsVariant = ["price", "compareAtPrice", "barcode", "sku"] as const;
export type TFieldVariant = (typeof fieldsVariant)[number];

const fieldsProduct = ["title", "descriptionHtml", "Statut", "Delete", "Handle", "type"] as const;
export type TFieldProduct = (typeof fieldsProduct)[number];

export type TCanal = { id: string; isPublished: boolean; name: string };
