export const cssCard =
    "p-3 shadow-lg border border-slate-300 bg-gradient-to-br from-slate-50 to-white min-[450px]:w-[400px] h-min";
export const classCopy = "cursor-pointer transition-transform duration-150 ease-out active:scale-90 hover:scale-105";

const fieldsVariant = ["price", "compareAtPrice", "barcode", "sku"] as const;
export type TFieldVariant = (typeof fieldsVariant)[number];

const fieldsProduct = ["title", "descriptionHtml", "Statut", "Delete"] as const;
export type TFieldProduct = (typeof fieldsProduct)[number];

export type TCanal = { id: string; isPublished: boolean; name: string };
