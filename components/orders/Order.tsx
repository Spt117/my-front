"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import Image from "next/image";
import ProductSection from "./ProductSection";

export default function Order({ order }: { order: GroupedShopifyOrder }) {
    const { handleCopy } = useCopy();

    const flagUrl = boutiqueFromDomain(order.shop)?.flag;

    return (
        <div className="container mx-auto p-3">
            <Card key={order.id} className="m-0 p-1 gap-1">
                <CardHeader className="flex flex-wrap justify-between items-center">
                    <div className="flex items-center justify-center gap-4">
                        <CardTitle className="text-lg transition-colors duration-300 group-hover:text-blue-600 group-hover:font-semibold flex gap-2">
                            {flagUrl && (
                                <Image
                                    src={flagUrl}
                                    alt={order.shop}
                                    width={30}
                                    height={30}
                                    className="ml-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2"
                                />
                            )}
                            <div className="flex items-center gap-2">
                                {order.name.map((name, index) => (
                                    <span key={index}>
                                        <a
                                            className="transition-all duration-200 ease-in-out hover:bg-gray-50 hover:shadow-sm rounded-md p-1 -m-1"
                                            href={`https://${order.shop}/admin/orders/${order.legacyResourceId[index]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {name}
                                        </a>
                                    </span>
                                ))}
                            </div>
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                        </p>
                        <p
                            onClick={() => handleCopy(order.customer.email)}
                            className="cursor-pointer transition-all duration-200 ease-in-out hover:font-bold rounded-md p-2 -m-2"
                        >
                            {order.customer.email}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        {order.shippingAddress.address1}, {order.shippingAddress.city}
                        <span className="text-sm font-medium"> {order.shippingAddress.country}</span>
                    </p>
                    <p className="text-sm text-gray-600">
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
                <div className="p-1 flex gap-3 flex-wrap">
                    {order.lineItems.edges.map(({ node }) => (
                        <ProductSection key={node.id} node={node} domain={order.shop} />
                    ))}
                </div>
            </Card>
        </div>
    );
}
