import useShopifyStore from "@/components/shopify/shopifyStore";
import { ShopifyOrder } from "@/library/shopify/orders";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrderSearch({ order }: { order: ShopifyOrder }) {
    const { shopifyBoutique } = useShopifyStore();
    const router = useRouter();
    const handleClickProduct = async () => {
        router.push(`/orders/${order.id.split("/").pop()}?domain=${shopifyBoutique?.domain}`); // Utiliser l'ID de la commande pour la navigation
    };
    return (
        <div onClick={handleClickProduct} key={order.id} className="cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
            <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={order.lineItems.edges[0].node.variant?.image || "/no_image.png"} alt={order.name} fill className="object-cover rounded-md" sizes="48px" priority={false} />
            </div>
            <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-foreground line-clamp-1">{order.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {order.id.split("/").pop()}</p>
            </div>
            <div className="text-sm font-semibold text-primary">{order.totalPriceSet.shopMoney.amount || "Prix indisponible"}</div>
        </div>
    );
}
