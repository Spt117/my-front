import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { IOrdersDomains } from "@/library/shopify/orders";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import useOrdersStore from "./store";

export default function OrdersList({ data }: { data: IOrdersDomains }) {
    const { setFilterOrders, orders } = useOrdersStore();

    const flagUrl = boutiqueFromDomain(data.shop)?.flag;

    const handleFilterClient = (client: string) => {
        const filtered = orders.filter((domain) => domain.shop === data.shop);
        const clientOrders = filtered[0].orders.filter((order) => order.customer.email === client);
        setFilterOrders([{ shop: data.shop, orders: clientOrders }]);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid gap-6">
                {data.orders.map((order) => (
                    <Card key={order.id} className="flex overflow-hidden">
                        <CardHeader>
                            <a className="flex items-center gap-2" href={`https://${data.shop}/admin/orders/${order.legacyResourceId}`} target="_blank" rel="noopener noreferrer">
                                {flagUrl && <Image src={flagUrl} alt={data.shop} width={30} height={30} className="ml-2" />}
                                <CardTitle className="text-lg">{order.name}</CardTitle>
                            </a>
                        </CardHeader>
                        {/* Product Images Section */}
                        <div className="w-1/3 bg-gray-50 p-4 flex flex-col gap-4">
                            {order.lineItems.edges.map(({ node }) => (
                                <div key={node.id} className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 z-0">
                                        <Image sizes="50" src={node.variant.product.featuredImage.url} alt={node.variant.product.featuredImage.altText || node.title} fill className="object-cover rounded-md" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{node.title}</p>
                                        <p className="text-xs text-gray-500">SKU: {node.sku}</p>
                                        {node.quantity === 1 && <p className="text-xs text-gray-500">Quantité: {node.quantity}</p>}
                                        {node.quantity > 1 && (
                                            <p className="text-sm text-red-500 font-bold flex items-center gap-1">
                                                <AlertTriangle />
                                                Quantités: {node.quantity}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Details Section */}
                        <div className="w-2/3">
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Date</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Total</p>
                                        <p className="text-sm text-gray-600">
                                            {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                                        </p>
                                    </div>
                                    <div onClick={() => handleFilterClient(order.customer.email)} className="cursor-pointer">
                                        <p className="text-sm font-medium">Client</p>
                                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Adresse de livraison</p>
                                        <p className="text-sm text-gray-600">
                                            {order.shippingAddress.address1}, {order.shippingAddress.city}, {order.shippingAddress.country}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
