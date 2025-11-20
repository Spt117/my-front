import { TDomainsShopify } from "@/params/paramsShopify";
import Image from "next/image";

export default function UsefullLinks({ domain, orderId }: { domain: TDomainsShopify; orderId: string }) {
    const colissimoUrl = `https://${domain}/admin/apps/colissimo-officiel/home?id=${orderId.split("/").pop()}`;
    const invoiceUrl = `https://${domain}/admin/apps/simple-invoice-1/orders/invoice/quick-edit?id=${orderId.split("/").pop()}`;
    const orderUrl = `https://${domain}/admin/orders/${orderId.split("/").pop()}`;

    const classParent =
        "flex items-center px-4 py-2 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm h-full";
    return (
        <>
            <a href={orderUrl} target="_blank" rel="noopener noreferrer">
                <div className={classParent}>
                    <Image
                        src="/shopify.png"
                        alt="Shopify"
                        width={0}
                        height={20}
                        style={{ width: "auto", height: "auto" }}
                        className="object-contain"
                    />
                </div>
            </a>
            <a href={colissimoUrl} target="_blank" rel="noopener noreferrer">
                <div className={classParent}>
                    <Image
                        src="/colissimo.png"
                        alt="Colissimo"
                        width={0}
                        height={20}
                        style={{ width: "auto", height: "auto" }}
                        className="object-contain"
                    />
                </div>
            </a>
            <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                <div className={classParent}>
                    <Image
                        src="/invoice.png"
                        alt="invoice"
                        width={0}
                        height={20}
                        style={{ width: "auto", height: "auto" }}
                        className="object-contain"
                    />
                </div>
            </a>
        </>
    );
}
