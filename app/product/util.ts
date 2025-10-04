export const cssCard = "shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white min-[450px]:w-[400px]";

const fieldsVariant = ["price", "compareAtPrice", "barcode"];
export type TFieldVariant = (typeof fieldsVariant)[number];

const fieldsProduct = ["title", "descriptionHtml"];
export type TFieldProduct = (typeof fieldsProduct)[number];
