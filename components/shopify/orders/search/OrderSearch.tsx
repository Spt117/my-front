import useShopifyStore from "@/components/shopify/shopifyStore";
import { ShopifyOrder } from "@/library/shopify/orders";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UsefullLinks from "../UsefullLinks";
import Link from "next/link";

export default function OrderSearch({ order }: { order: ShopifyOrder }) {
    const { shopifyBoutique, setSearchTerm } = useShopifyStore();
    const router = useRouter();

    if (!shopifyBoutique) return null;
    const url = `/shopify/${shopifyBoutique.id}/orders/${order.id.split("/").pop()}`;

    const handleClick = () => {
        setSearchTerm("");
        router.push(url);
    };

    return (
        <Link href={url}>
            <div className="flex border-b last:border-0" onClick={handleClick}>
                <div className="w-min-0 cursor-pointer flex items-center py-3 px-4 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                            src={order.lineItems.edges[0].node?.variant?.product.featuredImage.url || "/no_image.png"}
                            alt={order.name}
                            fill
                            className="object-cover rounded-md"
                            sizes="48px"
                            priority={false}
                        />
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex gap-2">
                            <h3 className="text-sm font-medium text-foreground line-clamp-1">{order.name}</h3>
                            <span className="text-sm text-muted-foreground line-clamp-1">
                                {order.totalPriceSet.shopMoney.amount || "Prix indisponible"} {shopifyBoutique.devise}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {order.id.split("/").pop()}</p>
                    </div>
                </div>
                <UsefullLinks domain={shopifyBoutique.domain} orderId={order.id} />
            </div>
        </Link>
    );
}
