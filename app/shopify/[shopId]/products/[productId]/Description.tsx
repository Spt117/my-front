// "use client";
// import useShopifyStore from "@/components/shopify/shopifyStore";
// import { Card, CardContent } from "@/components/ui/card";
// import { cssCard } from "./util";

// export default function Description() {
//     const { variant, product } = useShopifyStore();
//     if (!product || !variant) return null;

//     return (
//         <Card className={cssCard}>
//             <CardContent className="flex justify-between flex-col gap-4">
//                 <h3 className="text-lg font-medium">Description</h3>
//                 <div className="text-sm text-muted-foreground max-w-150" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
//             </CardContent>
//         </Card>
//     );
// }
