import useShopifyStore from "@/components/shopify/shopifyStore";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrderSearch({ order }: { order: GroupedShopifyOrder }) {
    const { shopifyBoutique } = useShopifyStore();
    const router = useRouter();
    const handleClickOrder = async () => {
        router.push(`/orders/${order.id.split("/").pop()}?domain=${shopifyBoutique?.domain}`); // Utiliser l'ID de la commande pour la navigation
    };

    if (!shopifyBoutique) return null;
    const orderUrl = `https://${shopifyBoutique.domain}/admin/orders/${order.id.split("/").pop()}`;
    const colissimoUrl = `https://${shopifyBoutique.domain}/admin/apps/colissimo-officiel/home?id=${order.id.split("/").pop()}`;

    return (
        <div className="flex border-b last:border-0">
            <div onClick={handleClickOrder} key={order.id} className="w-min cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="relative w-12 h-12 flex-shrink-0">
                    <Image src={order.lineItems.edges[0].node.variant.product.featuredImage.url || "/no_image.png"} alt={order.name[0]} fill className="object-cover rounded-md" sizes="48px" priority={false} />
                </div>
                <div className="ml-4 flex-1">
                    <div className="flex gap-2">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{order.name[0]}</h3>
                        <span className="text-sm text-muted-foreground line-clamp-1">
                            {order.totalPriceSet.shopMoney.amount || "Prix indisponible"} {shopifyBoutique.devise}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {order.id.split("/").pop()}</p>
                </div>
            </div>
            <div className="cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm text-sm text-blue-600">
                <a href={orderUrl} target="_blank" rel="noopener noreferrer">
                    <Image src="/shopify.png" alt="Shopify" width={50} height={50} className="object-contain" />
                </a>
            </div>
            <div className="cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm text-sm text-blue-600">
                <a href={colissimoUrl} target="_blank" rel="noopener noreferrer">
                    <Image src="/colissimo.png" alt="Colissimo" width={50} height={50} className="object-contain" />
                </a>
            </div>
        </div>
    );
}
