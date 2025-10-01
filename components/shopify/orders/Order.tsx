"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useCopy } from "@/library/hooks/useCopy";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { GroupedShopifyOrder } from "@/library/shopify/orders";
import Image from "next/image";
import ProductSection from "./ProductSection";
import UsefullLinks from "./UsefullLinks";

export default function Order({ order }: { order: GroupedShopifyOrder }) {
    const { handleCopy } = useCopy();
    const boutique = boutiqueFromDomain(order.shop);

    const colissimoUrl = `https://${boutique.domain}/admin/apps/colissimo-officiel/home?id=${order.id.split("/").pop()}`;
    const invoiceUrl = `https://${boutique.domain}/admin/apps/simple-invoice-1/orders/invoice/quick-edit?id=${order.id
        .split("/")
        .pop()}`;
    const orderUrl = `https://${boutique.domain}/admin/orders/${order.id.split("/").pop()}`;

    const classA = "cursor-pointer hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ";

    return (
        <div className="container mx-auto p-3">
            <Card key={order.id} className="m-0 p-1 gap-1">
                <CardHeader className="flex flex-wrap justify-between items-center">
                    <div className="flex items-center justify-center gap-4">
                        <CardTitle className="text-lg transition-colors duration-300 group-hover:text-blue-600 group-hover:font-semibold flex gap-0.5">
                            <Image
                                src={boutique.flag}
                                alt={order.shop}
                                width={30}
                                height={30}
                                className="ml-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2"
                            />

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
                            <UsefullLinks domain={boutique.domain} orderId={order.id} px="20px" />
                        </CardTitle>

                        {/* <a href={orderUrl} target="_blank" rel="noopener noreferrer" className={classA}>
                            <div className="w-[20px] h-[20px] relative">
                                <Image src="/shopify.png" alt="Shopify" fill sizes="20px" className="object-contain" />
                            </div>
                        </a>
                        <a href={colissimoUrl} target="_blank" rel="noopener noreferrer" className={classA}>
                            <div className="w-[20px] h-[20px] relative">
                                <Image src="/colissimo.png" alt="Colissimo" fill sizes="20px" className="object-contain" />
                            </div>
                        </a>
                        <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className={classA}>
                            <div className="w-[20px] h-[20px] relative">
                                <Image src="/invoice.png" alt="invoice" fill sizes="20px" className="object-contain" />
                            </div>
                        </a> */}

                        <p className="text-sm text-gray-600">
                            {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                        </p>
                        <p
                            onClick={() => handleCopy(order.customer.email)}
                            className="cursor-pointer transition-all duration-200 ease-in-out hover:font-bold rounded-md p-2 -m-2"
                        >
                            {order.customer.email}{" "}
                            <span className="text-sm text-gray-500">
                                ({order.customer.numberOfOrders} commande{Number(order.customer.numberOfOrders) > 1 ? "s" : ""}
                                {" -> "}
                                {order.customer.amountSpent.amount} {order.customer.amountSpent.currencyCode})
                            </span>
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
