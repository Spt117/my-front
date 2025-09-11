"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import Image from "next/image";
import ProductSection from "./ProductSection";
import useOrdersStore from "./store";

export default function Order({ order }: { order: GroupedShopifyOrder }) {
    const { setFilterOrders, orders } = useOrdersStore();
    const { handleCopy } = useCopy();

    const flagUrl = boutiqueFromDomain(order.shop)?.flag;

    return (
        <div className="container mx-auto p-4">
            <div className="grid gap-6">
                <Card key={order.id} className="flex overflow-hidden">
                    <CardHeader className="p-4 flex flex-wrap justify-between items-center gap-2">
                        <div>
                            <CardTitle className="text-lg transition-colors duration-300 group-hover:text-blue-600 group-hover:font-semibold flex gap-2">
                                {flagUrl && <Image src={flagUrl} alt={order.shop} width={30} height={30} className="ml-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />}
                                <div className="flex items-center gap-2">
                                    {order.name.map((name, index) => (
                                        <span key={index}>
                                            <a className="transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-sm rounded-md p-1 -m-1" href={`https://${order.shop}/admin/orders/${order.legacyResourceId[index]}`} target="_blank" rel="noopener noreferrer">
                                                {name}
                                            </a>
                                        </span>
                                    ))}
                                </div>
                            </CardTitle>
                        </div>
                        <p className="text-sm text-gray-600">
                            Le{" "}
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            })}
                        </p>
                    </CardHeader>
                    {/* Product Images Section */}
                    <div className=" bg-gray-50 p-4 flex gap-4">
                        {order.lineItems.edges.map(({ node }) => (
                            <ProductSection key={node.id} node={node} domain={order.shop} />
                        ))}
                    </div>

                    {/* Order Details Section */}
                    <div className="w-full">
                        <CardContent>
                            <div className="flex flex-col md:flex-row md:justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-sm font-medium">Montant</p>
                                    <p className="text-sm text-gray-600">
                                        {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                                    </p>
                                </div>
                                <div onClick={() => handleCopy(order.customer.email)} className="cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-sm rounded-md p-2 -m-2">
                                    {order.customer.email}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Adresse de livraison</p>
                                    <p className="text-sm text-gray-600">
                                        {order.shippingAddress.address1}, {order.shippingAddress.city}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </div>
    );
}
