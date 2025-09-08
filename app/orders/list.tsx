import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";
import { IOrdersDomains } from "@/library/shopify/orders";
import Image from "next/image";
import ProductSection from "./ProductSection";
import useOrdersStore from "./store";

export default function OrdersList({ data }: { data: IOrdersDomains }) {
    const { setFilterOrders, orders } = useOrdersStore();

    const flagUrl = boutiqueFromDomain(data.shop)?.flag;

    const handleFilterClient = (client: string) => {
        const filtered = orders.filter((domain) => domain.shop === data.shop);
        const clientOrders = filtered[0].orders.filter((order) => order.customer.email === client);
        setFilterOrders([{ shop: data.shop, orders: clientOrders }]);
    };

    // Fonction pour vérifier si un client a plusieurs commandes
    const getClientOrderCount = (clientEmail: string) => {
        const filtered = orders.filter((domain) => domain.shop === data.shop);
        if (filtered.length === 0) return 0;
        const clientOrders = filtered[0].orders.filter((order) => order.customer.email === clientEmail);
        return clientOrders.length;
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid gap-6">
                {data.orders.map((order) => {
                    const clientOrderCount = getClientOrderCount(order.customer.email);
                    return (
                        <Card key={order.id} className="flex overflow-hidden">
                            <CardHeader className="p-4 flex flex-wrap justify-between items-center gap-2">
                                <a className="flex items-center gap-2" href={`https://${data.shop}/admin/orders/${order.legacyResourceId}`} target="_blank" rel="noopener noreferrer">
                                    {flagUrl && <Image src={flagUrl} alt={data.shop} width={30} height={30} className="ml-2" />}
                                    <CardTitle className="text-lg">{order.name}</CardTitle>
                                </a>
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
                                    <ProductSection key={node.id} node={node} domain={data.shop} />
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
                                        <div onClick={() => handleFilterClient(order.customer.email)} className="cursor-pointer">
                                            {clientOrderCount === 1 && <p className="text-sm font-medium">Client</p>}{" "}
                                            {clientOrderCount > 1 && (
                                                <p className="inline mr-1 text-red-500 font-bold flex items-center gap-1">
                                                    <span>Ce client a {clientOrderCount} commande à traiter</span>
                                                </p>
                                            )}
                                            <p className={`text-sm text-gray-600 ${clientOrderCount > 1 ? "font-bold" : ""}`}>{order.customer.email}</p>
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
                    );
                })}
            </div>
        </div>
    );
}
